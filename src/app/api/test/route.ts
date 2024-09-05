import { type NextRequest, NextResponse } from "next/server";

interface Item {
  id: string;
  name: string;
  description: string;
}

let items: Item[] = [];

const generateId = (): string => Math.random().toString(36).substr(2, 9);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const item = items.find((i) => i.id === id);
    if (item) {
      return NextResponse.json(item, { status: 200 });
    } else {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }
  }

  return NextResponse.json(items, { status: 200 });
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const newItem: Item = { id: generateId(), ...data };
  items.push(newItem);

  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const data = await request.json();

  const itemIndex = items.findIndex((i) => i.id === id);
  if (itemIndex > -1) {
    items[itemIndex] = { ...items[itemIndex], ...data };
    return NextResponse.json(items[itemIndex], { status: 200 });
  } else {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const itemIndex = items.findIndex((i) => i.id === id);
  if (itemIndex > -1) {
    const deletedItem = items.splice(itemIndex, 1);
    return NextResponse.json(deletedItem[0], { status: 200 });
  } else {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }
}
