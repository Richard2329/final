import { NextResponse } from 'next/server';
import mqtt from 'mqtt';
import { iniciarOrden, registrarBolsa, finalizarLote } from '@/lib/services/produccion';

export const dynamic = 'force-dynamic';

// Cliente MQTT persistente a nivel de módulo (una sola conexión mientras viva el servidor)
let clienteMqtt: mqtt.MqttClient | null = null;
const TOPIC_CONTROL = 'produccion/llenado/control';

export function enviarInicioProduccion(lote: string) {

  if (!clienteMqtt) {
    console.error("❌ MQTT no conectado");
    return;
  }

  const mensaje = {
    accion: "INICIAR",
    lote: lote
  };

  clienteMqtt.publish(
    TOPIC_CONTROL,
    JSON.stringify(mensaje)
  );

  console.log("📤 Lote enviado a Wokwi:", mensaje);
}

export async function GET() {
  if (!clienteMqtt) {
    console.log("MQTT URL:",process.env.MQTT_BROKER_URL);

    console.log("MQTT USER:",process.env.MQTT_USER);

    clienteMqtt = mqtt.connect(process.env.MQTT_BROKER_URL || '', {
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASS,
    });

    clienteMqtt.on('connect', () => {
      console.log('🌐 [MQTT] Sincronizado con éxito a HiveMQ Cloud.');
      clienteMqtt?.subscribe('produccion/llenado/datos');
      clienteMqtt?.subscribe(TOPIC_CONTROL);
    });

    clienteMqtt.on('error', (err) => {
      console.error('❌ [MQTT] Error de conexión:', err);
    });

    // Este handler ya NO contiene lógica de negocio: solo identifica
    // la transacción y delega al servicio correspondiente.
    clienteMqtt.on('message', async (topic, message) => {
      try {
        const datos = JSON.parse(message.toString());
        console.log(`📥 [MQTT] Mensaje recibido en [${topic}]:`, datos);

        switch (datos.transaccion) {
          case 'ABRIR_ORDEN':
            await iniciarOrden(datos);
            break;
          case 'REGISTRO_BOLSA':
            await registrarBolsa(datos);
            break;
          case 'CERRAR_LOTE':
            await finalizarLote(datos);
            break;
          default:
            console.warn('⚠️ Transacción MQTT desconocida:', datos.transaccion);
        }
      } catch (error) {
        console.error('❌ Error general al procesar JSON MQTT:', error);
      }
    });
  }

  return NextResponse.json({ status: 'Escuchador MQTT activo' });
}
