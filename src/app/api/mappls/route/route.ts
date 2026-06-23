import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const from = req.nextUrl.searchParams.get('from')?.trim();
    const to = req.nextUrl.searchParams.get('to')?.trim();

    if (!from || !to) {
      return NextResponse.json(
        { message: 'from and to are required' },
        { status: 400 }
      );
    }
  const accessToken ='mstekmzbjlsdxbgfnroepwhgufsvulpazcmb';
    //const accessToken = process.env.MAPPLS_REST_KEY;
    if (!accessToken) {
      return NextResponse.json(
        { message: 'Missing MAPPLS_REST_KEY' },
        { status: 500 }
      );
    }

    // Route API accepts semicolon-separated waypoints
    const path = `${from};${to}`;
    const url =
      `https://route.mappls.com/route/direction/route_adv/driving/${encodeURIComponent(path)}` +
      `?geometries=geojson&steps=false&overview=full&alternatives=true&access_token=${encodeURIComponent(accessToken)}`;

    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { message: 'Mappls route failed', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Unexpected route error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}