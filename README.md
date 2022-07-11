# authJWT-API
Sistema di autenticazione e autorizzazione con jwt

## Installazione
Eseguire il clone del repository ed:
- installare nodejs e mongodb
- rinominare il file .env.example in .env popolandolo con i dati necessari
- eseguire ```npm ci```

## Eseguire i test senza installazione
Dopo aver eseguito ```npm ci``` installando tutte le librerie, sia di produzione che di dev:
- eseguire ```npm run test```

i test sono eseguiti con dei mock sulle funzioni che interrogano il database

## Scelte Architetturali
Ho deciso per questo progetto di creare delle api per l'autenticazione e l'autorizzazione degli utenti, ho aggiunto anche funzioni basilari all'utente loggato per provare l'autenticazione tramite token e l'autorizzazione tramite ruoli, avendo assegnato a ciascun ruolo dei permessi.

## Funzioni
Il sistema quindi ha le seguenti route/action

### register
route essenziale per la registrazione dell'utente: dopo una validazione e sanitizzazione dei dati in input e dopo aver fatto un check che l'utente non esistesse già, viene creato l'utente nel db e salvata la password (ovviamente cittografata), viene a questo punto creato un token con scadenza di 2 ore e passato all'utente che potrà utilizzarlo per le prossime richieste.

METHOD: POST

### login
Data email e password, dopo una validazione degli input, viene verificato che l'utente esita nel database e la password inserita sia corretta, a questo punto ritorna i dati dell'utente

METHOD: POST

### get data
questa route ritorna i dati dell'utente, per avere accesso a questa azione l'utente deve avere un token valido e non invalidato dall'admin

METHOD: GET

### change password
anche questa ha bisogno di un token in ingresso. Questa route vuole in input la email, la vecchia password e la nuova password, dopo aver fatto un check sul token, sull'esistenza dell'utente e sulla vecchia password, aggiorna l'utente con la password nuova.

METHOD: POST

## RUOLI
Per testare l'autorizzazione, quindi il check e il cambio dei permessi sono stati implementati due ruoli.
I permessi sono stati assegnati, ovviamente, solo a scopo dimostrativo 
### MEMBER
utente normale, unico permesso: leggere i propri dati
### MANAGER
utente manager con permessi di leggere i propri dati e cambiare la mail 

## Middleware
Il middleware ha quindi il molteplice compito di verificare il token e controllare se l'utente ha i permessi per poter richiedere quella risorsa.
Il controllo del token riguarda anche eventuali invalidazioni da parte dell'admin

## Invalidazione token
L'admin, tramite delle funzioni che può chiamare sul server da linea di comando può invalidare i token in due modi
### invalidazione di tutti i token per data
eseguendo il seguente comando ad esempio: ```node operationAdmin/invalidToken.js date``` viene salvata nel database una data che indica che i token precedenti a quella data sono invalidi, si occuperà il middleware di confrontare questa data (se esiste) con la data di creazione del token.
Può essere inserito un secondo parametro al comando, questo secondo paramertro è la data in millisecondi, se invece non viene inserita, verrà inserita in automatico la data attuale

### invalidazione token per utente
Qui ho deciso invece di fare una blacklist, l'admin tramite questo comando ad esempio ```node operationAdmin/invalidToken.js user alessio@example.com``` aggiunge questo utente nella blacklist. Il controllo viene fatto anche questa volta dal middleware che semplicemente controlla se l'utente esiste nella blacklist.
L'utente a questo punto avrà un token non valido e una sessione scaduta, sarà quindi obbligato a riloggarsi, al login verrà rimosso dalla blacklist

## Altre operazioni admin
### change role
tramite questa funzione l'utente può cambiare i permessi all'utente cambiandone il ruolo.
Comando di esempio : ```node operationAdmin/changeRoleUser.js alessio@example.com manager```
dove il primo parametro è la mail dell'utente e il secondo è il ruolo che si vuole impostare


