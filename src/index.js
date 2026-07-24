const RECIPIENTS = [
    "cvgumelarska@yahoo.com",
    "fawwasaliy11@gmail.com",
];

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
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

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // ==========================
        // API CONTACT
        // ==========================
        if (url.pathname === "/api/contact") {
            if (request.method !== "POST") {
                return json(
                    {
                        error: "Method Not Allowed",
                    },
                    405
                );
            }

            try {
                const body = await request.json();

                const name = String(body.name || "").trim();
                const email = String(body.email || "").trim();
                const company = String(body.company || "").trim();
                const message = String(body.message || "").trim();

                if (!name || !email || !message) {
                    return json(
                        {
                            error: "Nama, email, dan pesan wajib diisi.",
                        },
                        400
                    );
                }

                const response = await fetch(
                    "https://api.resend.com/emails",
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${env.RESEND_API_KEY}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            from: `Website Gumelar <${env.FROM_EMAIL}>`,
                            to: RECIPIENTS,
                            reply_to: email,
                            subject: `Pesan Baru dari ${name}${company ? ` (${company})` : ""}`,
                            html: `
                <h2>Pesan Baru</h2>

                <p><b>Nama:</b> ${escapeHtml(name)}</p>

                <p><b>Email:</b> ${escapeHtml(email)}</p>

                <p><b>Perusahaan:</b> ${escapeHtml(company || "-")}</p>

                <p><b>Pesan:</b></p>

                <p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>
              `,
                        }),
                    }
                );

                const result = await response.json().catch(() => ({}));

                if (!response.ok) {
                    return json(
                        {
                            error:
                                result.message ||
                                "Resend gagal mengirim email.",
                        },
                        500
                    );
                }

                return json({
                    ok: true,
                    message: "Pesan berhasil dikirim.",
                });
            } catch (err) {
                return json(
                    {
                        error: err.message,
                    },
                    500
                );
            }
        }

        // ==========================
        // WEBSITE
        // ==========================

        return env.ASSETS.fetch(request);
    },
};