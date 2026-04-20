import { NextResponse } from "next/server";
import { generateAllUserSummaries } from "@/lib/cron-handler";

export async function GET(req: Request) {
  // 1. Verify Authorization Header (Vercel Cron security)
  const authHeader = req.headers.get("authorization");
  
  // Vercel Cron automatically sends a Bearer token matching your CRON_SECRET env var
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error("❌ [Cron] Unauthorized access attempt.");
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // 2. Trigger the batch summary generation
    await generateAllUserSummaries();
    
    return NextResponse.json({ 
      success: true, 
      message: "Daily summaries generated successfully." 
    });
  } catch (error: any) {
    console.error("❌ [Cron] Automation Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error during summary generation" 
    }, { status: 500 });
  }
}
