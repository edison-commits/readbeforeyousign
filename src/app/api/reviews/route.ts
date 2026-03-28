import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // For MVP without auth, return all reviews
    // In production, filter by authenticated user
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        risk_score,
        summary,
        red_count,
        yellow_count,
        green_count,
        created_at,
        contracts (
          file_name,
          contract_type_display,
          parties,
          property_address
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('List reviews error:', error)
      return NextResponse.json({ reviews: [] })
    }

    return NextResponse.json({ reviews: data || [] })
  } catch (err: any) {
    console.error('Reviews API error:', err)
    return NextResponse.json({ reviews: [] })
  }
}
