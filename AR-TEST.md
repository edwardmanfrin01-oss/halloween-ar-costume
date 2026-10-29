# Prototipo Hiro

`index.html` e il QR esistente rimangono invariati. Il prototipo usa `ar.html`,
`ar.js` e `assets/ghost.png`. Non servono npm o un processo di build.
Le librerie esterne richiedono una connessione Internet.

## Pubblicazione e test

1. Includi tutti e tre i file del prototipo nel commit e pubblicali sul branch
   configurato per GitHub Pages. Non cambiare dominio, nome repository o URL del QR.
2. Apri l'URL attuale del sito aggiungendo `ar.html` dopo l'ultima `/`.
3. Apri il link al marker dalla pagina su un altro schermo oppure stampalo.
   Parti da un marker di circa 10–12 cm, piatto, opaco, con margine bianco.
4. Sul telefono apri la pagina in Safari (iPhone) o Chrome (Android), tramite HTTPS.
   Premi **Start camera** e concedi l'accesso alla fotocamera.
5. Inquadra l'intero marker, inizialmente a 30–60 cm in buona luce.
   Il fantasma deve comparire. Premi **Show test cube** per controllare la posa in 3D.
6. Muovi e inclina lentamente il marker: entrambi gli oggetti devono seguirlo.
   Nascondilo: l'oggetto deve scomparire. Mostralo di nuovo: deve ricomparire.
7. Prova il marker sul petto, l'orientamento verticale/orizzontale del telefono
   e l'illuminazione della festa. Tessuto piegato, riflessi e buio riducono il tracking.
8. Nega il permesso fotocamera e verifica il messaggio di recupero. Controlla
   **Back to BOO!** e il QR originale: devono ancora aprire la prima versione.

Il fantasma è un piano trasparente che sporge dal marker: visto di taglio diventa
sottile, comportamento previsto per un'immagine 2D. Non si orienta automaticamente
verso la camera, così conserva la rotazione del marker.

Per un test desktop puoi usare `python -m http.server 8000` e aprire
`http://localhost:8000/ar.html`. Un indirizzo HTTP della rete locale aperto dal
telefono non basta: usa la pubblicazione HTTPS. Il QR originale non è un marker Hiro.

## Limiti della verifica

Il controllo del codice non sostituisce i test con fotocamera e marker reali.
Confermare su entrambi i telefoni prima di integrare il pulsante nella home.

Documentazione: https://ar-js-org.github.io/AR.js-Docs/marker-based/
