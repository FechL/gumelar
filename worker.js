const RECIPIENTS = ["cvgumelarska@yahoo.com", "fawwasaliy11@gmail.com"];

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function readPayload(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  return {};
}

async function handleContact(request, env) {
  try {
    const payload = await readPayload(request);
    const name = String(payload.name || "").trim();
    const email = String(payload.email || "").trim();
    const company = String(payload.company || "").trim();
    const message = String(payload.message || "").trim();

    if (!name || !email || !message) {
      return jsonResponse({ error: "Nama, email/no HP, dan detail kebutuhan wajib diisi." }, 400);
    }

    const apiKey = env.RESEND_API_KEY;
    const fromEmail = env.FROM_EMAIL;

    if (!apiKey || !fromEmail) {
      return jsonResponse(
        {
          error:
            "Konfigurasi backend belum lengkap. Set RESEND_API_KEY dan FROM_EMAIL di environment Worker.",
        },
        500
      );
    }

    const subject = `Form contact Gumelar - ${name}${company ? ` (${company})` : ""}`;
    const html = `
      <h2>Pesan baru dari form contact</h2>
      <p><strong>Nama:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email / No HP:</strong> ${escapeHtml(email)}</p>
      <p><strong>Perusahaan:</strong> ${escapeHtml(company || "-")}</p>
      <p><strong>Detail kebutuhan:</strong></p>
      <p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Gumelar Contact <${fromEmail}>`,
        to: RECIPIENTS,
        reply_to: email,
        subject,
        html,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return jsonResponse(
        { error: result?.message || "Layanan email gagal memproses pesan." },
        502
      );
    }

    return jsonResponse({ ok: true, message: "Pesan berhasil dikirim." });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Terjadi kesalahan tak terduga.",
      },
      500
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
          },
        });
      }

      if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed." }, 405);
      }

      return handleContact(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },
};