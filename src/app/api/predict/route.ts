import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface PredictionResponse {
  lambda: number | null;
  probNext1: number | null;
  probNext5: number | null;
  probNext10: number | null;
  probNext15: number | null;
}

// Helper: check if time is within valid range
function isValidTime(time: string): boolean {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const minTime = 6 * 60 + 50; // 6:50
  const maxTime = 9 * 60 + 0;  // 9:00
  return totalMinutes >= minTime && totalMinutes <= maxTime;
}

// Helper: convert HH:MM to minutes since 6:50
function minuteFromStart(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h * 60 + m) - (6 * 60 + 50);
}

// Load processed data
function loadProcessedData() {
  const filePath = path.join(process.cwd(), 'public', 'processed-data.json');
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const route = searchParams.get('route') as 'C' | 'E9';
    const hour = searchParams.get('hour');

    if (!route || !hour) {
      return NextResponse.json({ error: 'Missing route or hour parameter' }, { status: 400 });
    }
    if (!['C', 'E9'].includes(route)) {
      return NextResponse.json({ error: 'Invalid route. Must be C or E9' }, { status: 400 });
    }
    if (!isValidTime(hour)) {
      return NextResponse.json({ error: 'Time out of range', message: 'La hora debe estar entre 06:50 y 09:00', validRange: '06:50 - 09:00' }, { status: 400 });
    }

    // Get minute from start
    const minute = minuteFromStart(hour);
    if (minute < 0) {
      return NextResponse.json({ error: 'Minute out of range' }, { status: 400 });
    }

    // Load processed data
    const processedData = loadProcessedData();
    
    // Get lambda for the specific minute
    const routeData = processedData[route as keyof typeof processedData];
    const lambda = routeData.minuteLambdas[minute] ?? null;

    console.log(`Route: ${route}, Minute: ${minute}, Lambda: ${lambda}`);

    // Probabilities
    let probNext1 = null, probNext5 = null, probNext10 = null, probNext15 = null;
    if (lambda !== null) {
      probNext1 = 1 - Math.exp(-lambda * 1);
      probNext5 = 1 - Math.exp(-lambda * 5);
      probNext10 = 1 - Math.exp(-lambda * 10);
      probNext15 = 1 - Math.exp(-lambda * 15);
    }

    const response: PredictionResponse = {
      lambda: lambda !== null ? Math.round(lambda * 1000) / 1000 : null,
      probNext1: probNext1 !== null ? Math.round(probNext1 * 1000) / 1000 : null,
      probNext5: probNext5 !== null ? Math.round(probNext5 * 1000) / 1000 : null,
      probNext10: probNext10 !== null ? Math.round(probNext10 * 1000) / 1000 : null,
      probNext15: probNext15 !== null ? Math.round(probNext15 * 1000) / 1000 : null
    };

    console.log('Prediction response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 