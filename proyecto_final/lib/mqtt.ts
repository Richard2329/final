import mqtt from "mqtt";

let clienteMqtt: mqtt.MqttClient | null = null;

const TOPIC_CONTROL = "produccion/llenado/control";

export function conectarMQTT(){

    if(!clienteMqtt){

        clienteMqtt = mqtt.connect(
            process.env.MQTT_BROKER_URL!,
            {
                username: process.env.MQTT_USER,
                password: process.env.MQTT_PASS
            }
        );

        clienteMqtt.on("connect",()=>{
            console.log("✅ MQTT servicio conectado");
        });

    }

    return clienteMqtt;
}


export function enviarInicioProduccion(lote:string){
    console.log("📡 FUNCION MQTT LLAMADA CON:", lote);
    const mqtt = conectarMQTT();

    console.log("📤 Intentando enviar lote:", lote);

    if(!mqtt.connected){
        console.log("⏳ MQTT todavía no conectado");
        
        mqtt.on("connect",()=>{
            mqtt.publish(
                "produccion/llenado/control",
                JSON.stringify({
                    accion:"INICIAR",
                    lote:lote
                })
            );

            console.log("✅ Lote enviado después de conexión");
        });

        return;
    }


    mqtt.publish(
        "produccion/llenado/control",
        JSON.stringify({
            accion:"INICIAR",
            lote:lote
        })
    );


    console.log("✅ Lote enviado a Wokwi:", lote);
}