import mqtt from "mqtt";

export async function enviarInicioProduccion(lote: string) {
  console.log("📡 FUNCION MQTT LLAMADA CON:", lote);

  return new Promise<void>((resolve, reject) => {

    const cliente = mqtt.connect(process.env.MQTT_BROKER_URL!, {
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASS,
    });

    cliente.on("connect", () => {

      console.log("✅ MQTT conectado");

      cliente.publish(
        "produccion/llenado/control",
        JSON.stringify({
          accion: "INICIAR",
          lote: lote,
        }),
        (err) => {

          if (err) {
            console.error("❌ Error enviando MQTT:", err);
            cliente.end();
            reject(err);
            return;
          }

          console.log("📤 Lote enviado a Wokwi:", lote);

          cliente.end(true, () => {
            console.log("🔌 MQTT desconectado");
            resolve();
          });

        }
      );

    });

    cliente.on("error", (err) => {
      console.error("❌ Error MQTT:", err);
      cliente.end(true);
      reject(err);
    });

  });
}
