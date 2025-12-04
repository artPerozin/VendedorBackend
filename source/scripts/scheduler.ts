import dotenv from "dotenv";
dotenv.config();
import cron from "node-cron";
import { runProspection } from "./startProspectCampaign";

function getBrazilTime() {
    const now = new Date();

    const brString = now.toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour12: false
    });

    // Ex.: "04/12/2025, 13:33:07"
    const [datePart, timePart] = brString.split(", ");
    const [hour, minute, second] = timePart.split(":").map(Number);

    return { hour, minute, second };
}

function isWithinSchedule(): boolean {
    const schedule = process.env.PROSPECT_SCHEDULE ?? "";
    console.log("📅 PROSPECT_SCHEDULE recebido:", schedule);

    if (!schedule) {
        console.log("⚠️ Nenhum horário configurado. Permitindo execução.");
        return true;
    }

    const { hour, minute } = getBrazilTime();
    const minutes = hour * 60 + minute;
    console.log(`🕒 Agora (BR): ${hour}:${minute} | Minutos do dia: ${minutes}`);

    const ranges = schedule.split(",");
    console.log("⏱️ Intervalos encontrados:", ranges);

    for (const range of ranges) {
        console.log(`➡️ Avaliando intervalo: ${range}`);

        const [start, end] = range.split("-");
        if (!start || !end) {
            console.log("⛔ Intervalo inválido, ignorando.");
            continue;
        }

        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);

        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;

        console.log(`   ↳ Início: ${start} (${startMinutes} min)`);
        console.log(`   ↳ Fim: ${end} (${endMinutes} min)`);

        if (minutes >= startMinutes && minutes <= endMinutes) {
            console.log("✅ Dentro do intervalo permitido. Execução liberada.");
            return true;
        } else {
            console.log("❌ Fora deste intervalo.");
        }
    }

    console.log("⛔ Nenhum intervalo corresponde ao horário atual. Execução bloqueada.");
    return false;
}

cron.schedule("* * * * *", async () => {
    console.log("🔁 Cron executado:", new Date().toISOString());

    if (!isWithinSchedule()) {
        console.log("🚫 Execução abortada pelo horário.");
        return;
    }

    try {
        console.log("🚀 Iniciando runProspection...");
        await runProspection();
        console.log("✅ runProspection finalizou.");
    } catch (err) {
        console.error("🔥 Erro na rotina:", err);
    }
});
