# Asset: abandono

Tipo: escena
Dimensiones recomendadas: 320x180 px (16:9, escalar a display con pixel-perfect)
Estilo: pixel art, paleta limitada (máx 10 colores), paleta fría y desaturada — contraste deliberado con las escenas de amor
Descripción de contenido: El personaje se va. Vista desde atrás: el personaje caminando en dirección contraria al usuario-cámara, alejándose. La figura del personaje es pequeña en el encuadre, ya a cierta distancia. No hay figura del usuario visible — el punto de vista es subjetivo (lo que ve el usuario). Ambiente: lluvia ligera o cielo gris, calle vacía, o corredor interior que se aleja hacia una puerta entreabierta. El personaje no mira atrás. El suelo puede tener reflejos de lluvia en pixel art (1-2 píxeles de reflejo). No hay objetos compartidos — la escena está vacía excepto por la figura que se va.
Emoción / mood: Pérdida sin drama. No es una pelea — es ausencia. La persona simplemente no está más. Más triste que enojada.
Notas para generación con IA: "pixel art scene, character walking away from viewer, seen from behind, rainy or overcast setting, empty street or corridor, cold desaturated color palette (blues and grays), character small in frame and distant, no other characters, reflections on wet ground, 320x180 pixels, limited palette 10 colors, melancholic mood, flat pixel art style, clean outlines"
Nombre de archivo final esperado: abandono.png

## Nota de implementación
Esta escena se activa cuando el usuario no registra actividad en X semanas. Si el personaje estaba en nivel 0 al momento del abandono, el slot se resetea completamente. La escena debe funcionar para ambos casos — abandono desde cualquier nivel.
