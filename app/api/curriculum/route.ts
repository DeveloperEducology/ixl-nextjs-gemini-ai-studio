import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Curriculum from '@/models/Curriculum';

export async function GET() {
  try {
    await connectDB();
    const data = await Curriculum.find({}).sort({ subject: 1, gradeId: 1 });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const newData = await Curriculum.create(body);
    return NextResponse.json(newData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}