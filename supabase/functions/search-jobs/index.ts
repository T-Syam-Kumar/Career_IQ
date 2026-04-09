const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const BodySchema = z.object({
  skills: z.array(z.string().min(1)).min(1).max(20),
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY')
    if (!RAPIDAPI_KEY) {
      return new Response(JSON.stringify({ error: 'RAPIDAPI_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use top 3 skills for a more focused query
    const topSkills = parsed.data.skills.slice(0, 3).join(' ')
    const query = `${topSkills} developer`
    console.log('Search query:', query)

    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&date_posted=month`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`RapidAPI error [${response.status}]: ${errorText}`)
      return new Response(JSON.stringify({ error: 'Failed to fetch jobs from API' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    console.log('RapidAPI response status:', response.status, 'jobs count:', (data.data || []).length)
    const jobs = (data.data || []).slice(0, 10).map((job: any) => ({
      title: job.job_title || 'Untitled',
      company: job.employer_name || 'Unknown',
      location: job.job_city ? `${job.job_city}, ${job.job_state || ''}` : (job.job_country || 'Remote'),
      url: job.job_apply_link || job.job_google_link || '#',
      description: (job.job_description || '').substring(0, 200),
    }))

    return new Response(JSON.stringify({ jobs }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
