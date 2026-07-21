import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  mockUsers, 
  initialKpiCs, 
  initialKpiFos, 
  initialMonitoring, 
  initialTemplates, 
  initialKnowledge, 
  initialActivityLogs 
} from './src/mockData';
import { SystemSettings } from './src/types';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'data-store.json');

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Initial state
const defaultSettings: SystemSettings = {
  theme: 'light',
  googleSheetUrl: '',
  appsScriptUrl: '',
  logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150',
  companyName: 'Grapari Garuda Indonesia'
};

interface DatabaseState {
  users: typeof mockUsers;
  kpi_cs: typeof initialKpiCs;
  kpi_fos: typeof initialKpiFos;
  monitoring: typeof initialMonitoring;
  templates: typeof initialTemplates;
  knowledge: typeof initialKnowledge;
  activity_logs: typeof initialActivityLogs;
  settings: SystemSettings;
}

// Ensure database file exists, or initialize it
let dbState: DatabaseState = {
  users: mockUsers,
  kpi_cs: initialKpiCs,
  kpi_fos: initialKpiFos,
  monitoring: initialMonitoring,
  templates: initialTemplates,
  knowledge: initialKnowledge,
  activity_logs: initialActivityLogs,
  settings: defaultSettings
};

function readDb() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      dbState = JSON.parse(data);
    } else {
      writeDb();
    }
  } catch (err) {
    console.error('Error reading local data file, resetting to initial state:', err);
  }
}

function writeDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local data file:', err);
  }
}

// Initial read
readDb();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Helper to log user activities
  function logActivity(user: string, role: string, action: string, details: string) {
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      details
    };
    dbState.activity_logs.unshift(newLog);
    // Keep last 150 entries
    if (dbState.activity_logs.length > 150) {
      dbState.activity_logs = dbState.activity_logs.slice(0, 150);
    }
    writeDb();
  }

  // --- API ROUTING ---

  // Auth: Login Endpoint
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = dbState.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    logActivity(user.name, user.role, 'USER_LOGIN', `Successfully logged in via credentials`);
    res.json({
      token: `grapari-session-token-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        nik: user.nik,
        photo: user.photo
      }
    });
  });

  // Generic Data fetch
  app.get('/api/data/:sheetName', (req, res) => {
    const { sheetName } = req.params;
    readDb(); // refresh state

    if (sheetName === 'kpi_cs') {
      return res.json(dbState.kpi_cs);
    } else if (sheetName === 'kpi_fos') {
      return res.json(dbState.kpi_fos);
    } else if (sheetName === 'monitoring') {
      return res.json(dbState.monitoring);
    } else if (sheetName === 'templates') {
      return res.json(dbState.templates);
    } else if (sheetName === 'knowledge') {
      return res.json(dbState.knowledge);
    } else if (sheetName === 'activity_logs') {
      return res.json(dbState.activity_logs);
    } else if (sheetName === 'users') {
      // Don't expose passwords
      const safeUsers = dbState.users.map(({ passwordHash, ...rest }) => rest);
      return res.json(safeUsers);
    } else if (sheetName === 'settings') {
      return res.json(dbState.settings);
    }

    res.status(404).json({ error: 'Data table not found' });
  });

  // Generic Data write / insertion
  app.post('/api/data/:sheetName', (req, res) => {
    const { sheetName } = req.params;
    const body = req.body;
    const userHeader = req.headers['x-user-name'] as string || 'Unknown';
    const roleHeader = req.headers['x-user-role'] as string || 'Customer Service';

    const id = body.id || `${sheetName.substring(0, 3)}-${Date.now()}`;
    const newRecord = { ...body, id };

    readDb();

    if (sheetName === 'kpi_cs') {
      dbState.kpi_cs.push(newRecord);
      logActivity(userHeader, roleHeader, 'CREATE_KPI_CS', `Added CS record for ${newRecord.name || newRecord.id}`);
    } else if (sheetName === 'kpi_fos') {
      dbState.kpi_fos.push(newRecord);
      logActivity(userHeader, roleHeader, 'CREATE_KPI_FOS', `Added FOS record for ${newRecord.name || newRecord.id}`);
    } else if (sheetName === 'monitoring') {
      newRecord.createdDate = newRecord.createdDate || new Date().toISOString();
      newRecord.updatedDate = newRecord.updatedDate || new Date().toISOString();
      dbState.monitoring.unshift(newRecord);
      logActivity(userHeader, roleHeader, 'CREATE_MONITORING', `Opened ticket ${newRecord.ticketNumber} for ${newRecord.customerName}`);
    } else if (sheetName === 'templates') {
      dbState.templates.push(newRecord);
      logActivity(userHeader, roleHeader, 'CREATE_TEMPLATE', `Added template "${newRecord.title}"`);
    } else if (sheetName === 'knowledge') {
      dbState.knowledge.push(newRecord);
      logActivity(userHeader, roleHeader, 'CREATE_KNOWLEDGE', `Added article "${newRecord.title}"`);
    } else if (sheetName === 'users') {
      const existing = dbState.users.find(u => u.username.toLowerCase() === body.username?.toLowerCase());
      if (existing) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      dbState.users.push({
        id: `user-${Date.now()}`,
        username: body.username,
        passwordHash: body.password || '123456',
        role: body.role || 'Customer Service',
        name: body.name || body.username,
        nik: body.nik || `GG-00${Math.floor(100 + Math.random() * 899)}`,
        photo: body.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
      });
      logActivity(userHeader, roleHeader, 'CREATE_USER', `Created new user ${body.name}`);
    } else if (sheetName === 'settings') {
      dbState.settings = { ...dbState.settings, ...body };
      logActivity(userHeader, roleHeader, 'UPDATE_SETTINGS', `Updated global application settings`);
    } else {
      return res.status(404).json({ error: 'Invalid sheet name' });
    }

    writeDb();
    res.json(newRecord);
  });

  // Generic Data edit
  app.put('/api/data/:sheetName/:id', (req, res) => {
    const { sheetName, id } = req.params;
    const body = req.body;
    const userHeader = req.headers['x-user-name'] as string || 'Unknown';
    const roleHeader = req.headers['x-user-role'] as string || 'Customer Service';

    readDb();

    if (sheetName === 'kpi_cs') {
      const idx = dbState.kpi_cs.findIndex(item => item.id === id);
      if (idx !== -1) {
        dbState.kpi_cs[idx] = { ...dbState.kpi_cs[idx], ...body, id };
        logActivity(userHeader, roleHeader, 'UPDATE_KPI_CS', `Updated CS KPI for ${dbState.kpi_cs[idx].name}`);
      } else return res.status(404).json({ error: 'CS KPI not found' });
    } else if (sheetName === 'kpi_fos') {
      const idx = dbState.kpi_fos.findIndex(item => item.id === id);
      if (idx !== -1) {
        dbState.kpi_fos[idx] = { ...dbState.kpi_fos[idx], ...body, id };
        logActivity(userHeader, roleHeader, 'UPDATE_KPI_FOS', `Updated FOS KPI for ${dbState.kpi_fos[idx].name}`);
      } else return res.status(404).json({ error: 'FOS KPI not found' });
    } else if (sheetName === 'monitoring') {
      const idx = dbState.monitoring.findIndex(item => item.id === id);
      if (idx !== -1) {
        dbState.monitoring[idx] = { 
          ...dbState.monitoring[idx], 
          ...body, 
          id, 
          updatedDate: new Date().toISOString() 
        };
        logActivity(userHeader, roleHeader, 'UPDATE_MONITORING', `Updated ticket ${dbState.monitoring[idx].ticketNumber} to "${dbState.monitoring[idx].status}"`);
      } else return res.status(404).json({ error: 'Monitoring ticket not found' });
    } else if (sheetName === 'templates') {
      const idx = dbState.templates.findIndex(item => item.id === id);
      if (idx !== -1) {
        dbState.templates[idx] = { ...dbState.templates[idx], ...body, id };
        logActivity(userHeader, roleHeader, 'UPDATE_TEMPLATE', `Modified template "${dbState.templates[idx].title}"`);
      } else return res.status(404).json({ error: 'Template not found' });
    } else if (sheetName === 'knowledge') {
      const idx = dbState.knowledge.findIndex(item => item.id === id);
      if (idx !== -1) {
        dbState.knowledge[idx] = { ...dbState.knowledge[idx], ...body, id };
        logActivity(userHeader, roleHeader, 'UPDATE_KNOWLEDGE', `Modified knowledge guide "${dbState.knowledge[idx].title}"`);
      } else return res.status(404).json({ error: 'Knowledge record not found' });
    } else if (sheetName === 'users') {
      const idx = dbState.users.findIndex(item => item.id === id);
      if (idx !== -1) {
        dbState.users[idx] = { ...dbState.users[idx], ...body, id };
        logActivity(userHeader, roleHeader, 'UPDATE_USER', `Updated details for ${dbState.users[idx].name}`);
      } else return res.status(404).json({ error: 'User not found' });
    } else {
      return res.status(404).json({ error: 'Table not found' });
    }

    writeDb();
    res.json({ success: true });
  });

  // Generic Data delete
  app.delete('/api/data/:sheetName/:id', (req, res) => {
    const { sheetName, id } = req.params;
    const userHeader = req.headers['x-user-name'] as string || 'Unknown';
    const roleHeader = req.headers['x-user-role'] as string || 'Customer Service';

    readDb();

    if (sheetName === 'kpi_cs') {
      const record = dbState.kpi_cs.find(item => item.id === id);
      dbState.kpi_cs = dbState.kpi_cs.filter(item => item.id !== id);
      logActivity(userHeader, roleHeader, 'DELETE_KPI_CS', `Removed CS KPI for ${record?.name || id}`);
    } else if (sheetName === 'kpi_fos') {
      const record = dbState.kpi_fos.find(item => item.id === id);
      dbState.kpi_fos = dbState.kpi_fos.filter(item => item.id !== id);
      logActivity(userHeader, roleHeader, 'DELETE_KPI_FOS', `Removed FOS KPI for ${record?.name || id}`);
    } else if (sheetName === 'monitoring') {
      const record = dbState.monitoring.find(item => item.id === id);
      dbState.monitoring = dbState.monitoring.filter(item => item.id !== id);
      logActivity(userHeader, roleHeader, 'DELETE_MONITORING', `Removed ticket ${record?.ticketNumber || id}`);
    } else if (sheetName === 'templates') {
      const record = dbState.templates.find(item => item.id === id);
      dbState.templates = dbState.templates.filter(item => item.id !== id);
      logActivity(userHeader, roleHeader, 'DELETE_TEMPLATE', `Removed template "${record?.title || id}"`);
    } else if (sheetName === 'knowledge') {
      const record = dbState.knowledge.find(item => item.id === id);
      dbState.knowledge = dbState.knowledge.filter(item => item.id !== id);
      logActivity(userHeader, roleHeader, 'DELETE_KNOWLEDGE', `Removed article "${record?.title || id}"`);
    } else if (sheetName === 'users') {
      const record = dbState.users.find(item => item.id === id);
      if (record?.username === 'admin') {
        return res.status(400).json({ error: 'Cannot delete primary administrator account' });
      }
      dbState.users = dbState.users.filter(item => item.id !== id);
      logActivity(userHeader, roleHeader, 'DELETE_USER', `Deleted user account ${record?.name || id}`);
    } else {
      return res.status(404).json({ error: 'Table not found' });
    }

    writeDb();
    res.json({ success: true });
  });

  // Custom bulk importer
  app.post('/api/data/import/:sheetName', (req, res) => {
    const { sheetName } = req.params;
    const { data } = req.body;
    const userHeader = req.headers['x-user-name'] as string || 'Unknown';
    const roleHeader = req.headers['x-user-role'] as string || 'Customer Service';

    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'Import content must be an array of objects' });
    }

    readDb();

    if (sheetName === 'kpi_cs') {
      data.forEach(record => {
        const id = record.id || `cs-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        dbState.kpi_cs.push({
          id,
          photo: record.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          name: record.name || 'CS Agent',
          nik: record.nik || `GG-00${Math.floor(100 + Math.random() * 899)}`,
          sales: Number(record.sales) || 0,
          productivity: Number(record.productivity) || 0,
          attendance: Number(record.attendance) || 100,
          roleplay: Number(record.roleplay) || 80,
          achievement: Number(record.achievement) || 80,
          notes: record.notes || 'Imported via Excel Dashboard.',
          ranking: Number(record.ranking) || dbState.kpi_cs.length + 1,
          progress: Number(record.progress) || 0,
          target: Number(record.target) || 100,
          status: record.status || 'Good'
        });
      });
      // Sort rank
      dbState.kpi_cs.sort((a, b) => b.achievement - a.achievement);
      dbState.kpi_cs.forEach((item, index) => {
        item.ranking = index + 1;
      });
      logActivity(userHeader, roleHeader, 'IMPORT_KPI_CS', `Bulk imported ${data.length} records into CS Table`);

    } else if (sheetName === 'kpi_fos') {
      data.forEach(record => {
        const id = record.id || `fos-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        dbState.kpi_fos.push({
          id,
          photo: record.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          name: record.name || 'FOS Agent',
          nik: record.nik || `GG-00${Math.floor(100 + Math.random() * 899)}`,
          monitoringTicket: Number(record.monitoringTicket) || 0,
          inSla: Number(record.inSla) || 0,
          outSla: Number(record.outSla) || 0,
          achievement: Number(record.achievement) || 100,
          notes: record.notes || 'Imported via Excel.',
          ranking: Number(record.ranking) || dbState.kpi_fos.length + 1,
          status: record.status || 'Good'
        });
      });
      dbState.kpi_fos.sort((a, b) => b.achievement - a.achievement);
      dbState.kpi_fos.forEach((item, index) => {
        item.ranking = index + 1;
      });
      logActivity(userHeader, roleHeader, 'IMPORT_KPI_FOS', `Bulk imported ${data.length} records into FOS Table`);

    } else if (sheetName === 'monitoring') {
      data.forEach(record => {
        const id = record.id || `mon-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        dbState.monitoring.unshift({
          id,
          type: record.type || 'Indihome',
          customerName: record.customerName || 'Customer',
          csName: record.csName || 'Siti Rahma',
          nik: record.nik || 'GG-00511',
          msisdn: record.msisdn || '0811000000',
          indihomeNumber: record.indihomeNumber || '-',
          complaint: record.complaint || 'No detail provided',
          ticketNumber: record.ticketNumber || `IN-${Date.now().toString().slice(-4)}`,
          sla: Number(record.sla) || 24,
          category: record.category || 'Technical',
          status: record.status || 'Open',
          notes: record.notes || 'Imported.',
          createdDate: record.createdDate || new Date().toISOString(),
          updatedDate: new Date().toISOString()
        });
      });
      logActivity(userHeader, roleHeader, 'IMPORT_MONITORING', `Bulk imported ${data.length} monitoring tickets`);
    } else {
      return res.status(400).json({ error: 'Bulk import not supported for this sheet' });
    }

    writeDb();
    res.json({ success: true, count: data.length });
  });

  // Spotlight AI Assistant with Grounding and Grapari Garuda SOP System Instructions
  app.post('/api/ai-assistant', async (req, res) => {
    const { prompt, chatHistory } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
      if (!ai) {
        // If Gemini client is not initialized because the key was not loaded yet
        return res.json({ 
          response: `Halo! Saya adalah **Asisten AI Grapari Garuda**. Saat ini kunci API (GEMINI_API_KEY) belum terkonfigurasi di lingkungan Anda. 
          
Berikut adalah info FAQ ringkas dari basis pengetahuan lokal:
- **LOS Merah Kedip**: Redaman kabel putus atau dropcore tertekuk. Standard redaman ideal adalah **-18 s/d -24 dBm**.
- **Reaktivasi Prabayar**: Wajib membawa E-KTP asli dan kartu fisik, serta melakukan scan biometrik Dukcapil.
- **Telkomsel Halo**: Tawarkan paket migrasi Halo+ 100GB seharga Rp 100.000 dengan Limit Control.`
        });
      }

      // Read knowledge base to contextualize AI responses
      const localKnowledgeContext = dbState.knowledge.map(k => `[Title: ${k.title}] \n[Category: ${k.category}] \n[Type: ${k.type}] \n[Content]:\n${k.content}`).join('\n\n---\n\n');

      const systemInstruction = `You are the highly professional "Asisten AI Grapari Garuda", a top-tier customer service and technical expert.
Your job is to assist Grapari customer service and FOS (Field Operations) representatives by providing accurate SOPs, troubleshooting guides, script suggestions, and quick answers.

Use the local knowledge base content provided below to ground your answers. Highlight redaman levels (-18 to -24 dBm is ideal, anything over -28 dBm is critical), step-by-step procedures, and scripts for customer handling.
Respond in Indonesian language with a professional, polite, and helpful tone (similar to official Telkomsel standards). Use markdown formatting for readability.

### LOCAL KNOWLEDGE BASE DIRECTORY:
${localKnowledgeContext}`;

      const contents: any[] = [];
      if (chatHistory && Array.isArray(chatHistory)) {
        chatHistory.forEach(msg => {
          const role = msg.role === 'user' ? 'user' : 'model';
          if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts[0].text += `\n\n${msg.content}`;
          } else {
            contents.push({
              role,
              parts: [{ text: msg.content }]
            });
          }
        });
      }
      
      const currentRole = 'user';
      if (contents.length > 0 && contents[contents.length - 1].role === currentRole) {
        contents[contents.length - 1].parts[0].text += `\n\n${prompt}`;
      } else {
        contents.push({
          role: currentRole,
          parts: [{ text: prompt }]
        });
      }

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
      } catch (firstErr: any) {
        console.warn('Primary model (gemini-3.5-flash) failed or busy. Falling back to gemini-flash-latest...', firstErr);
        response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
      }

      res.json({ response: response.text });
    } catch (err: any) {
      console.error('Gemini API call failed:', err);
      res.status(500).json({ error: 'AI Assistant failed to generate content', details: err?.message });
    }
  });

  // --- MOUNT VITE / STATIC MIDDLWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Enterprise Server running on http://localhost:${PORT}`);
  });
}

startServer();
