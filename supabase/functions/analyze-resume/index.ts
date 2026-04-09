const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const BodySchema = z.object({
  resumeText: z.string().min(20).max(50000),
  action: z.enum(['analyze', 'suggestions', 'interview', 'rewrite', 'learning-path', 'jd-match', 'build-resume']),
  extra: z.any().optional(),
})

const SYSTEM_PROMPTS: Record<string, string> = {
  analyze: `You are an expert ATS resume analyzer. Given resume text, return a JSON object with:
{
  "atsScore": number (0-100),
  "breakdown": { "keywords": number, "formatting": number, "experience": number, "skills": number, "education": number },
  "skills": string[],
  "missingSkills": string[],
  "experience": string (e.g. "3+ years"),
  "summary": string (2-3 sentence summary),
  "jobTitle": string (detected job title/role),
  "suggestions": [{ "title": string, "impact": "high"|"medium"|"low", "before": string, "after": string }]
}
Be accurate and realistic with ATS scoring. Return ONLY valid JSON, no markdown.`,

  suggestions: `You are a resume improvement expert. Given resume text, provide 5 specific, actionable suggestions as JSON:
[{ "title": string, "impact": "high"|"medium"|"low", "description": string, "before": string, "after": string }]
Focus on ATS optimization, quantifiable achievements, and action verbs. Return ONLY valid JSON.`,

  interview: `You are an interview preparation coach. Given resume text and optionally a target role, generate 8 interview questions as JSON:
[{ "question": string, "category": string, "difficulty": "easy"|"medium"|"hard", "sampleAnswer": string }]
Mix behavioral, technical, and situational questions. Return ONLY valid JSON.`,

  rewrite: `You are a professional resume writer. Rewrite the given section/text to be more ATS-friendly, using strong action verbs, quantifiable results, and industry keywords. Return the improved text as plain text.`,

  'learning-path': `You are a career development advisor. Given the user's current skills and missing skills, create a personalized learning path as JSON:
[{ "title": string, "platform": string, "type": "course"|"certification"|"tutorial", "duration": string, "priority": "high"|"medium"|"low", "url": string }]
Include real platforms like Coursera, Udemy, LinkedIn Learning, etc. Return ONLY valid JSON.`,

  'jd-match': `You are an ATS matching expert. Compare the resume against the job description and return JSON:
{
  "matchScore": number (0-100),
  "matchingSkills": string[],
  "missingSkills": string[],
  "suggestions": string[],
  "keywordGaps": string[]
}
Return ONLY valid JSON.`,

  'build-resume': `You are a professional resume builder. Given the user's information, create a well-structured, ATS-optimized resume in plain text format. Use proper sections, action verbs, and industry keywords. Format it professionally.`,
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
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

    const { resumeText, action, extra } = parsed.data
    const systemPrompt = SYSTEM_PROMPTS[action]

    let userPrompt = `Resume:\n${resumeText}`
    if (action === 'interview' && extra?.targetRole) {
      userPrompt += `\n\nTarget Role: ${extra.targetRole}`
    }
    if (action === 'rewrite' && extra?.text) {
      userPrompt = `Rewrite this resume section:\n${extra.text}\n\nContext from full resume:\n${resumeText}`
    }
    if (action === 'jd-match' && extra?.jobDescription) {
      userPrompt += `\n\nJob Description:\n${extra.jobDescription}`
    }
    if (action === 'build-resume' && extra?.info) {
      userPrompt = `Create a resume with this information:\n${JSON.stringify(extra.info)}`
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        stream: action === 'rewrite' || action === 'build-resume',
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const t = await response.text()
      console.error('AI gateway error:', response.status, t)
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // For streaming actions, pass through the stream
    if (action === 'rewrite' || action === 'build-resume') {
      return new Response(response.body, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      })
    }

    // For JSON actions, parse and return
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const result = JSON.parse(clean)
      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch {
      return new Response(JSON.stringify({ result: content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('analyze-resume error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
