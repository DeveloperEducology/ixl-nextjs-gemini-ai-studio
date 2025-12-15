import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Curriculum from '@/models/Curriculum';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const data = await Curriculum.findById(params.id);
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const data = await Curriculum.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    await Curriculum.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}