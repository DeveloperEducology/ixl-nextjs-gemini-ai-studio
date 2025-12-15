import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Question from '@/models/Question';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const skillId = searchParams.get('skillId');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '1');

    const query: any = {};
    if (skillId) query.skillId = skillId;
    if (difficulty) query.difficultyLevel = difficulty;

    // specific question ID fetch
    const id = searchParams.get('id');
    if (id) {
        const question = await Question.findOne({ id });
        return NextResponse.json(question);
    }

    // Random fetch using MongoDB aggregation
    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: limit } }
    ]);

    if (limit === 1) {
        return NextResponse.json(questions[0] || null);
    }

    return NextResponse.json(questions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Validate required fields
    if (!body.id || !body.skillId || !body.type || !body.prompt) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newQuestion = await Question.create(body);
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error: any) {
    // Handle duplicate ID error
    if (error.code === 11000) {
        return NextResponse.json({ error: 'Question with this ID already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}