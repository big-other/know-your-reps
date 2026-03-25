import { NextRequest, NextResponse } from "next/server";
import { getPacDisbursements } from "@/lib/fec";
import aiPacs from "@/data/ai-pacs.json";
import { writeFileSync } from "fs";
import { join } from "path";

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && cronSecret !== "a_random_secret_for_protecting_cron_endpoint") {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const recipients: Record<
      string,
      {
        contributions: {
          pac_name: string;
          parent_company: string;
          amount: number;
          fec_id: string;
        }[];
        total_amount: number;
      }
    > = {};

    for (const pac of aiPacs.pacs) {
      if (!pac.fec_id) continue;

      try {
        const disbursements = await getPacDisbursements(pac.fec_id, 2026);

        for (const d of disbursements) {
          if (!d.recipient_name || d.amount <= 0) continue;

          const key = d.recipient_name.toUpperCase().trim();

          if (!recipients[key]) {
            recipients[key] = { contributions: [], total_amount: 0 };
          }

          recipients[key].contributions.push({
            pac_name: pac.name,
            parent_company: pac.parent_company,
            amount: d.amount,
            fec_id: pac.fec_id,
          });
          recipients[key].total_amount += d.amount;
        }
      } catch (error) {
        console.error(`Error fetching disbursements for ${pac.name}:`, error);
      }
    }

    const cacheData = {
      last_updated: new Date().toISOString(),
      recipients,
    };

    // Write to data file
    const cachePath = join(process.cwd(), "data", "pac-recipients-cache.json");
    writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));

    return NextResponse.json({
      success: true,
      recipientCount: Object.keys(recipients).length,
      lastUpdated: cacheData.last_updated,
    });
  } catch (error) {
    console.error("PAC refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh PAC data" },
      { status: 500 }
    );
  }
}
