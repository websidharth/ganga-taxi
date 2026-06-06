import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://search.mappls.com/search/places/autosuggest/json';

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('query')?.trim() || '';
    const location = req.nextUrl.searchParams.get('location')?.trim() || '';

    if (!query) {
      return NextResponse.json({ suggestedLocations: [] });
    }

    const accessToken ='mstekmzbjlsdxbgfnroepwhgufsvulpazcmb';
    if (!accessToken) {
      return NextResponse.json(
        { message: 'Missing MAPPLS_REST_KEY' },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      query,
      access_token: accessToken,
    });

    if (location) {
      params.set('location', location);
      params.set('hyperLocal', '');
    }

    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { message: 'Mappls autosuggest failed', details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Unexpected autosuggest error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}