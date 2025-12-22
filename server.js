import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

// Initialize App
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- MOCK DATABASE (In-Memory) ---
const PROPERTIES = [
  { id: 'p1', name: 'Villa Sunny Side', address: '12 Chemin des Oliviers, Nice', ownerId: 'u3', status: 'active', externalIds: { beds24: '12345' } },
  { id: 'p2', name: 'Loft Industriel', address: '45 Rue de la République, Lyon', ownerId: 'u3', status: 'active', externalIds: { beds24: '67890' } },
  { id: 'p3', name: 'Chalet Alpin', address: '8 Route des Pistes, Chamonix', ownerId: 'u7', status: 'maintenance', externalIds: {} },
];

let RESERVATIONS = [
  { id: 'r1', propertyId: 'p1', guestName: 'Alice Voyageur', status: 'checked-in', totalAmount: 450, platform: 'Airbnb', startDate: '2023-10-25', endDate: '2023-10-28' },
  { id: 'r2', propertyId: 'p2', guestName: 'John Doe', status: 'confirmed', totalAmount: 800, platform: 'Booking', startDate: '2023-11-01', endDate: '2023-11-05' },
];

let TASKS = [
  { id: 't1', type: 'CLEANING', propertyId: 'p1', status: 'PENDING', description: 'Ménage complet après départ' },
  { id: 't2', type: 'LAUNDRY_DELIVERY', propertyId: 'p1', status: 'PENDING', description: 'Livraison kit complet' },
];

let LAUNDRY_ORDERS = [
  { id: 'lo1', date: '2023-10-25', sender: 'HostFlow Nice', receiver: 'EcoPressing', status: 'ACCEPTED', items: [{ item: 'Drap', quantity: 20 }] }
];


// --- ICAL EXPORT ENDPOINT ---
// Generates a mock .ics file for a given property
app.get('/api/ical/export/:propertyId/calendar.ics', (req, res) => {
  const { propertyId } = req.params;
  const property = PROPERTIES.find(p => p.id === propertyId);
  const reservations = RESERVATIONS.filter(r => r.propertyId === propertyId);

  if (!property) return res.status(404).send('Property not found');

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HostFlow//NONSGML v1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  reservations.forEach(res => {
     // Format dates to YYYYMMDD
     const start = res.startDate ? res.startDate.replace(/-/g, '') : '20231025';
     const end = res.endDate ? res.endDate.replace(/-/g, '') : '20231028';

     icsContent.push('BEGIN:VEVENT');
     icsContent.push(`UID:${res.id}@hostflow.app`);
     icsContent.push(`DTSTART;VALUE=DATE:${start}`);
     icsContent.push(`DTEND;VALUE=DATE:${end}`);
     icsContent.push(`SUMMARY:Réservé (${res.platform})`);
     icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');

  res.setHeader('Content-Type', 'text/calendar');
  res.setHeader('Content-Disposition', `attachment; filename="calendar_${propertyId}.ics"`);
  res.send(icsContent.join('\r\n'));
});


// --- STANDARD API ROUTES ---

app.get('/', (req, res) => {
  res.send('HostFlow Pro API is running');
});

app.get('/api/properties', (req, res) => {
  res.json(PROPERTIES);
});

app.get('/api/reservations', (req, res) => {
  res.json(RESERVATIONS);
});

app.get('/api/tasks', (req, res) => {
  res.json(TASKS);
});

// AI Endpoint
app.post('/api/chat', async (req, res) => {
  const { message, history, propertyContext } = req.body;
  
  // Fallback for demo if no key
  if (!process.env.API_KEY) {
    return res.json({ text: "Mode démo (Sans Clé API): Je suis l'IA HostFlow. En production, je répondrais intelligemment ici." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = ai.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
    });

    const result = await chat.sendMessage(`${propertyContext}\n\nUser: ${message}`);
    const response = await result.response;
    res.json({ text: response.text() });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "AI Service Unavailable" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});