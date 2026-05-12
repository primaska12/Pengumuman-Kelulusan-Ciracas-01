import express from 'express';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_admin_key_123';
const DATA_DIR = process.env.DATA_DIR || __dirname;

const DB_FILE = path.join(DATA_DIR, 'data.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Postgres setup
const pool = process.env.DATABASE_URL
  ? new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('dpg-') ? false : { rejectUnauthorized: false }
    })
  : null;

if (pool) {
  // Initialize Postgres table
  pool.query(`
    CREATE TABLE IF NOT EXISTS key_value_store (
      key VARCHAR(255) PRIMARY KEY,
      value JSONB NOT NULL
    );
  `).catch(err => console.error('Error creating PG table:', err));
}

// Interface for DB
interface Student {
  id: number;
  nama: string;
  nisn: string;
  noPeserta: string;
  kelas: string;
  sekolah: string;
  status: string;
  tahunAjaran: string;
  createdAt: string;
}

interface AppSettings {
  releaseDate: string | null;
  message: string;
  failMessage?: string;
  admins?: { username: string; password: string }[];
  activeYear?: string | null;
}

// Helper to read Settings
async function readSettings(): Promise<AppSettings> {
  try {
    let settings: AppSettings | null = null;
    if (pool) {
      const res = await pool.query('SELECT value FROM key_value_store WHERE key = $1', ['settings']);
      if (res.rows.length > 0) {
        settings = res.rows[0].value as AppSettings;
      }
    } else {
      const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
      settings = JSON.parse(data) as AppSettings;
    }

    if (settings) {
      if (!settings.admins) {
        settings.admins = [{ username: 'admin', password: 'admin123' }];
      }
      return settings;
    }
    throw new Error('Settings not found');
  } catch (err) {
    const defaultSettings: AppSettings = {
      releaseDate: null,
      message: '',
      failMessage: '',
      admins: [{ username: 'admin', password: 'admin123' }],
      activeYear: null
    };
    await writeSettings(defaultSettings);
    return defaultSettings;
  }
}

// Helper to write Settings
async function writeSettings(data: AppSettings): Promise<void> {
  if (pool) {
    await pool.query(
      'INSERT INTO key_value_store (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      ['settings', JSON.stringify(data)]
    );
  } else {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }
}

// Helper to read DB
async function readDB(): Promise<Student[]> {
  try {
    let parsedData: Student[] = [];
    if (pool) {
      const res = await pool.query('SELECT value FROM key_value_store WHERE key = $1', ['students']);
      if (res.rows.length > 0) {
        parsedData = res.rows[0].value as Student[];
      } else {
        throw new Error('No students found');
      }
    } else {
      const data = await fs.readFile(DB_FILE, 'utf-8');
      parsedData = JSON.parse(data) as Student[];
    }
    
    // Backwards compatibility for old records
    return parsedData.map(s => ({
      ...s,
      tahunAjaran: s.tahunAjaran || '2023/2024',
      createdAt: s.createdAt || new Date().toISOString()
    }));
  } catch (err) {
    // If file doesn't exist, create default
    const defaultData: Student[] = [
      {
        id: 1,
        nama: 'Muhammad Rayhan Pratama',
        nisn: '1234567890',
        noPeserta: '01-123-456-8',
        kelas: 'VI - A',
        sekolah: 'SDN CIRACAS 01',
        status: 'Lulus',
        tahunAjaran: '2023/2024',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        nama: 'Siswa Teladan Satu',
        nisn: '0098726152',
        noPeserta: '01-999-888-7',
        kelas: 'VI - B',
        sekolah: 'SDN CIRACAS 01',
        status: 'Lulus',
        tahunAjaran: '2023/2024',
        createdAt: new Date().toISOString()
      }
    ];
    await writeDB(defaultData);
    return defaultData;
  }
}

// Helper to write DB
async function writeDB(data: Student[]): Promise<void> {
  if (pool) {
    await pool.query(
      'INSERT INTO key_value_store (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      ['students', JSON.stringify(data)]
    );
  } else {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Ensure DB exists on startup
  await readDB();

  // Middleware to check admin token
  const authenticateAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Settings (Public)
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await readSettings();
      res.json({ releaseDate: settings.releaseDate, message: settings.message, failMessage: settings.failMessage });
    } catch (e) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Settings (Admin)
  app.get('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
      const settings = await readSettings();
      res.json(settings);
    } catch (e) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
      const { releaseDate, message, failMessage, admins, activeYear } = req.body;
      const currentSettings = await readSettings();
      const newSettings = { 
        releaseDate, 
        message: message || '',
        failMessage: failMessage || '',
        admins: admins || currentSettings.admins,
        activeYear: activeYear !== undefined ? activeYear : currentSettings.activeYear
      };
      await writeSettings(newSettings);
      res.json({ success: true, settings: newSettings });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin Login
  app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    const settings = await readSettings();
    const adminUser = settings.admins?.find(a => a.username === username && a.password === password);
    
    if (adminUser) {
      const token = jwt.sign({ username: adminUser.username }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Username atau password salah' });
    }
  });

  // Search single student (public)
  app.get('/api/students/search', async (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: 'Query is missing' });
    
    try {
      const settings = await readSettings();
      const students = await readDB();
      
      // Search from the latest entry first by reversing the array so they get the newest record
      const student = [...students].reverse().find(s => {
        const matchIdentifier = s.nisn === query || s.noPeserta === query;
        if (!matchIdentifier) return false;
        
        // If an active year is set in settings, only match students from that year
        if (settings.activeYear && settings.activeYear.trim() !== '') {
          return s.tahunAjaran === settings.activeYear;
        }
        
        return true;
      });
      
      if (student) {
        res.json(student);
      } else {
        res.status(404).json({ error: 'Data tidak ditemukan' });
      }
    } catch (e) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all students (Admin)
  app.get('/api/admin/students', authenticateAdmin, async (req, res) => {
    try {
      const students = await readDB();
      res.json(students.reverse()); // latest first
    } catch (e) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Add student (Admin)
  app.post('/api/admin/students', authenticateAdmin, async (req, res) => {
    const { nama, nisn, noPeserta, kelas, sekolah, status, tahunAjaran } = req.body;
    try {
      const students = await readDB();
      
      if (students.some(s => s.nisn === nisn || s.noPeserta === noPeserta)) {
         return res.status(400).json({ error: 'NISN atau No Peserta sudah ada.' });
      }

      const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
      const newStudent: Student = {
        id: newId,
        nama,
        nisn,
        noPeserta,
        kelas,
        sekolah: sekolah || 'SDN CIRACAS 01',
        status: status || 'Lulus',
        tahunAjaran: tahunAjaran || '2023/2024',
        createdAt: new Date().toISOString()
      };
      
      students.push(newStudent);
      await writeDB(students);
      
      res.status(201).json(newStudent);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Batch add students (Admin)
  app.post('/api/admin/students/batch', authenticateAdmin, async (req, res) => {
    const { students: newStudents } = req.body;
    if (!Array.isArray(newStudents)) return res.status(400).json({ error: 'Invalid payload' });

    try {
      const students = await readDB();
      let newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
      
      let addedCount = 0;
      let skippedCount = 0;
      const createdAt = new Date().toISOString();

      for (const item of newStudents) {
        if (!item.nama || !item.nisn || !item.noPeserta) {
          skippedCount++;
          continue;
        }
        
        // Skip duplicates
        if (students.some(s => s.nisn === item.nisn || s.noPeserta === item.noPeserta)) {
          skippedCount++;
          continue;
        }

        students.push({
          id: newId++,
          nama: item.nama,
          nisn: item.nisn,
          noPeserta: item.noPeserta,
          kelas: item.kelas || '-',
          sekolah: item.sekolah || 'SDN CIRACAS 01',
          status: item.status || 'Lulus',
          tahunAjaran: item.tahunAjaran || '2023/2024',
          createdAt: createdAt
        });
        addedCount++;
      }
      
      await writeDB(students);
      res.json({ success: true, added: addedCount, skipped: skippedCount });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Update student (Admin)
  app.put('/api/admin/students/:id', authenticateAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { nama, nisn, noPeserta, kelas, sekolah, status, tahunAjaran } = req.body;
    try {
      const students = await readDB();
      const index = students.findIndex(s => s.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Siswa tidak ditemukan' });
      }
      
      // Check for uniqueness of nisn and noPeserta
      if (students.some(s => s.id !== id && (s.nisn === nisn || s.noPeserta === noPeserta))) {
         return res.status(400).json({ error: 'NISN atau No Peserta sudah dipakai siswa lain.' });
      }

      students[index] = {
        ...students[index],
        nama, nisn, noPeserta, kelas, sekolah,
        status: status || 'Lulus',
        tahunAjaran: tahunAjaran || students[index].tahunAjaran
      };
      
      await writeDB(students);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Delete student (Admin)
  app.delete('/api/admin/students/:id', authenticateAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      let students = await readDB();
      students = students.filter(s => s.id !== id);
      await writeDB(students);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete archive (Admin)
  app.delete('/api/admin/archives', authenticateAdmin, async (req, res) => {
    const year = req.query.year as string;
    if (!year) return res.status(400).json({ error: 'Year is required' });
    try {
      let students = await readDB();
      const initialLength = students.length;
      students = students.filter(s => s.tahunAjaran !== year);
      await writeDB(students);
      res.json({ success: true, deleted: initialLength - students.length });
    } catch (e) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
