const config = require("../config.js").load();
module.exports = {

    //Notificatoin for FTTH migration
    notificationNames: {
        N1: { phases: ["Richiesta di migrazione del servizio"] },
        N2: { phases: ["Richiesta di desospensione o annullamento da Recipient"] },
        N3: { phases: ["Richiesta di rimodulazione DAC da Recipient"] },
        N4: { phases: ["Notifica di variazione di stato"] },
        N5: { phases: ["Notifica dell’eventuale rimodulazione della DAC"] },
        N6: { phases: ["Comunicazione di inizio Policy di Contatto"] },
        N7: { phases: ["Notifica espletamento ordine (OK/KO)"] },
        N8: { phases: ["Richiesta di verifica codice sessione vs Operatore Donating"] },

        N9: { phases: ["Riscontro (OK/KO) sulla verifica del codice sessione a cura Operatore Donating"] },

        N10: {
            phases: ["Notifiche verso il Donating, per comunicare",
                "Prima DAC",
                "Esito migrazione (OK/KO)",
                "Annullamento da Recipient"]
        },
        N11: {
            phases: ["Notifiche dal Recipient vs il Donor",
                "Notifica preventiva di NP",
                "Notifica richiesta esecuzione NP",
                "Notifica KO"]
        },

        N12: { phases: ["Messaggi sincroni di OK/KO di risposta a tutti le notifiche inviate in tutte le direzioni. Tale notifica non è riportata nei digrammi di seguito riportati, tranne nei casi in cui rappresenta uno step di processo."] },
        N13: { phases: ["Notifica KO da Donor vs Recipient su numerazioni da portare"] }
    },


    /* REGOLE DI PROCESSO --- Allegato1.pptx ---- 
    L’Operatore Wholesale di Rete  Recipient (B) ha la possibilità di:
    inviare un KO fino al  giorno della DAC inclusa
    rimodulare la richiesta di migrazione fino al giorno della DAC inclusa
    sospendere la richiesta  di migrazione fino al giorno della DAC inclusa.
    L’ordine di migrazione inviato dall’Operatore Wholesale di Rete Recipient (B):
    all’Operatore Fornitore del Segmento di Terminazione (C)  non contiene la ragione sociale dell’Operatore Recipient (A) e dell’Operatore Donating (E);
    all’Operatore Wholesale di Rete Donating (D)  non contiene la ragione sociale dell’Operatore Recipient (A).
    In caso di processo Wholesaler:
    In presenza di Operatore Wholesale Recipient (A1), quest’ultimo medierà le notifiche tra Operatore Recipient (A) e Operatore Wholesale di Rete Recipient (B).
    In presenza di Operatore Wholesale Donating  (E1), quest’ultimo medierà le notifiche tra Operatore wholesale di Rete Donating (D) e Operatore Donating (E).
    Per giorno lavorativo si intende dal lunedì al venerdì, esclusi festivi infrasettimanali. 
    Fatta eccezione per le rimodulazioni causa cliente, durante l’intervento on field l’Operatore B può 
    rimodulare la DAC unicamente in caso di circostanze eccezionali, non prevedibili e che devono essere 
    adeguatamente documentate in caso di richiesta da parte dell’Operatore Recipient. 
    Le causali di rimodulazione sono elencate in Allegato 5. */

    DAC: {}, //Data richiesta migrazione. Se previsto intervento presso il cliente la DAC è la data dell'appuntamento.

    /*Formato codice di migrazione
    COW codice operatore Donating 3 cifre alfanumeriche
    COR codice risorsa 12 cifre alfanumeriche codice del Wholesale
    COS codice di servizio 3 cifre alfanumeriche, codice operatore di terminazione SdT primi 2 caratteri, servizio terzo carattere
    CC codice di controllo*/
    migrationCode: { COW: "", COR: "", COS: "", CC: "" },

    /* 
    Richiesta Migrazione (N1)
    L’Operatore Recipient (A), dopo aver effettuato la fase 2 con esito positivo con l’Operatore Donating (E), invia all’Operatore Wholesale di Rete Recipient (B) una richiesta di migrazione.
    La richiesta di migrazione può essere inviata anche dall’Operatore A1 all’Operatore B, nel caso di Operatore Wholesale. 
    Nella tabella seguente è riportato il set di informazioni necessarie per la richiesta di migrazione. 
    */
    N1RecToWhslMigrationRequest: {
        CODICE_OPERATORE_REC: { mandatory: 1 },
        CODICE_ORDINE_REC: { mandatory: 1 },          //Struttura: <CODICE_OPERATORE_REC>_<codice univoco>, dove <codice univoco> è un codice univoco definito dall’Operatore Recipient
        CODICE_OPERATORE_WHS: { mandatory: 1 },          // 3 cifre Codice univoco che identifica l’operatore di Rete che riceve la richiesta di migrazione dal Recipient 
        ID_NOTIFICA: { mandatory: 1 },          //identificativo unicovo notifica   
        DATA_NOTIFICA: { mandatory: 1 },          //Data della notifica YYYY-MM-DDThh:mm:ssTZD 
        NOME_REFERENTE_TECNICO_OLO: { mandatory: 0 },          //Opzionale
        COGNOME_REFERENTE_TECNICO_OLO: { mandatory: 1 },
        TELEFONO_REFERENTE_TECNICO_OLO: { mandatory: 1 },
        EMAIL_REFERENTE_TECNICO_OLO: { mandatory: 1 },
        TELEFONO_REFERENTE_OLO_ONFIELD_NOTECH: { mandatory: 0 },          //Opzionale
        COMPETENZA_QUARTO_REFERENTE: { mandatory: 0 },          //Opzionale. Indica il motivo per il quale può essere contatto il 4° referente on field: 1 – Qualsiasi motivo 2 – Motivi Cliente 3 – Motivi tecnici
        NOME_CLIENTE: { mandatory: 0 },          //Opzionale
        COGNOME_CLIENTE: { mandatory: 1 },
        RECAPITO_TELEFONICO_CLIENTE_1: { mandatory: 0 },          //Opzionale
        RECAPITO_TELEFONICO_CLIENTE_2: { mandatory: 0 },          //Opzionale
        CONTATTO_VIRTUALE: { mandatory: 0 },          //Opzionale. Default 0
        MODALITA_CONTATTO_VIRTUALE: { mandatory: 1 },          //Il campo non va valorizzato nel caso in cui CONTATTO_VIRTUALE = 0 o non valorizzato.Può essere valorizzato solo se CONTATTO_VIRTUALE = 1 secondo le modalità concordate tra gli Operatori A e B nell’ambito
        DATA_PREVISTA_ATTIVAZIONE: { mandatory: 0 },          //Opzionale
        ID_BUILDING: { mandatory: 0 },          //Opzionale
        SCALA_PALAZZINA: { mandatory: 0 },          //Opzionale
        NOTE: { mandatory: 0 },          //Opzionale
        DATI_MIGRAZIONE: { mandatory: 1 },
        CODICE_SESSIONE: { mandatory: 1 },
        COR: { mandatory: 1 },
        COW: { mandatory: 1 },
        COS: { mandatory: 1 },
        NUMERAZIONI: { mandatory: 0 },         //Opzionale
        DN: { mandatory: 1 },
        SERVIZIO_FTTH: { mandatory: 1 },         //Aggregato obbligatorio. Contiene le informazioni del servizio FTTH richiesto dall’Operatore A/A1 nella migrazione.Tali informazioni vengono specificate dall’Operatore Wholesale di Rete.    
        SERVIZI_OPZIONALI: { mandatory: 0 }          //Opzionale
    },

    /*
    Richieste Operatore Recipient (N2)
    L’Operatore Recipient A/A1 utilizza la notifica N2 per notificare all’Operatore Wholesale di Rete:
    • De-sospensioni 
    • Richieste di annullamento.
    Nella tabella seguente è riportato il set di informazioni necessarie per la richiesta.*/
    N2RecToWhslRecipientRequest: {
        CODICE_OPERATORE_REC: { mandatory: 1 },
        CODICE_ORDINE_REC: { mandatory: 1 },          //Struttura: <CODICE_OPERATORE_REC>_<codice univoco>, dove <codice univoco> è un codice univoco definito dall’Operatore Recipient
        CODICE_OPERATORE_WHS: { mandatory: 1 },          // 3 cifre Codice univoco che identifica l’operatore di Rete che riceve la richiesta di migrazione dal Recipient 
        ID_NOTIFICA: { mandatory: 1 },          //identificativo unicovo notifica   
        DATA_NOTIFICA: { mandatory: 1 },          //Data della notifica YYYY-MM-DDThh:mm:ssTZD 
        AZIONE: { mandatory: 1 },          //"0" Desospensione "1" Richiesta annullamento
        NOME_CLIENTE: { mandatory: 0 },          //Opzionale
        COGNOME_CLIENTE: { mandatory: 0 },
        RECAPITO_TELEFONICO_CLIENTE_1: { mandatory: 0 },          //Opzionale
        RECAPITO_TELEFONICO_CLIENTE_2: { mandatory: 0 },          //Opzionale
        CODICE_MOTIVAZIONE: { mandatory: 0 },          //Opzionale. Default 0
        MOTIVAZIONE: { mandatory: 0 },          //Il campo non va valorizzato nel caso in cui CONTATTO_VIRTUALE = 0 o non valorizzato.Può essere valorizzato solo se CONTATTO_VIRTUALE = 1 secondo le modalità concordate tra gli Operatori A e B nell’ambito
        DATA_PREVISTA_ATTIVAZIONE: { mandatory: 0 },          //Opzionale
        ORARIO_APPUNTAMENTO: { mandatory: 0 },          //Opzionale
        NOTE: { mandatory: 0 },          //Opzionale
        SERVIZIO_FTTH: { mandatory: 0 },          //Aggregato obbligatorio. Contiene le informazioni del servizio FTTH richiesto dall’Operatore A/A1 nella migrazione.Tali informazioni vengono specificate dall’Operatore Wholesale di Rete.    
        SERVIZI_OPZIONALI: { mandatory: 0 }           //Opzionale
    },

    /* 
    Rimodulazione Operatore Recipient (N3)
    L’Operatore Recipient (A/A1) invia la rimodulazione DAC per una data richiesta di migrazione.
    Nella tabella seguente è riportato il set di informazioni necessarie per la richiesta.*/
    N3RecToWhslRimodulationDacMigration: {
        CODICE_OPERATORE_REC: { mandatory: 1 },
        CODICE_ORDINE_REC: { mandatory: 1 },          //Struttura: <CODICE_OPERATORE_REC>_<codice univoco>, dove <codice univoco> è un codice univoco definito dall’Operatore Recipient
        CODICE_OPERATORE_WHS: { mandatory: 1 },          // 3 cifre Codice univoco che identifica l’operatore di Rete che riceve la richiesta di migrazione dal Recipient 
        ID_NOTIFICA: { mandatory: 1 },          //identificativo unicovo notifica   
        DATA_NOTIFICA: { mandatory: 1 },          //Data della notifica YYYY-MM-DDThh:mm:ssTZD 
        DATA_PREVISTA_ATTIVAZIONE: { mandatory: 1 },          //Opzionale
        ORARIO_APPUNTAMENTO: { mandatory: 1 },          //Opzionale
        NOME_CLIENTE: { mandatory: 0 },          //Opzionale
        COGNOME_CLIENTE: { mandatory: 0 },
        RECAPITO_TELEFONICO_CLIENTE_1: { mandatory: 0 },          //Opzionale
        RECAPITO_TELEFONICO_CLIENTE_2: { mandatory: 0 },          //Opzionale
        CODICE_MOTIVAZIONE: { mandatory: 1 },          //Opzionale. Default 0
        MOTIVAZIONE: { mandatory: 1 },          //Il campo non va valorizzato nel caso in cui CONTATTO_VIRTUALE = 0 o non valorizzato.Può essere valorizzato solo se CONTATTO_VIRTUALE = 1 secondo le modalità concordate tra gli Operatori A e B nell’ambito
        NOTE: { mandatory: 0 },          //Opzionale
        SERVIZIO_FTTH: { mandatory: 0 },          //Aggregato obbligatorio. Contiene le informazioni del servizio FTTH richiesto dall’Operatore A/A1 nella migrazione.Tali informazioni vengono specificate dall’Operatore Wholesale di Rete.    
        SERVIZI_OPZIONALI: { mandatory: 0 }           //Opzionale
    },


    /*
    Le richieste inviate dall’Operatore Wholesale di Rete all’Operatore Recipient sono le seguenti:
                    • Messaggi di gestione dell’ordine:
                        ◦ Aggiornamento stato (N4)
                        ◦ Rimodulazione DAC (N5)
                        ◦ Inizio Policy di Contatto (N6)
                    • Messaggio di espletamento ordine richiesta di attivazione:
                        ◦ Espletamento (N7)*/

    /*
    Aggiornamento stato (N4)
    La notifica di Aggiornamento stato è inviata dall’Operatore di Rete Wholesale all’Operatore Recipient 
    per notificare il cambio dello stato dell’ordine.
    I passaggi di stato notificati con tale notifica sono:
        • Acquisito
        • Acquisito KO
        • Accettato (comprende la verifica OK del codice sessione)
        • Accettato KO (comprende la verifica del codice sessione KO)
        • Sospeso
        • Annullato (a seguito dell’annullamento inviato dal Recipient)
    La notifica di “Accettato” ha anche valore di Comunicazione DAC nella prima notifica di accettazione.
    Nella tabella seguente è riportato il set di informazioni necessarie per la richiesta.*/

    /*
    Rimodulazione DAC (N5)
    L’Operatore Wholesale di Rete può inviare all’Operatore A/A1 un’eventuale rimodulazione della DAC, 
    successiva alla prima comunicazione DAC inviata contestualmente alla notifica di Accettazione.
    Nella tabella seguente è riportato il set di informazioni necessarie per la richiesta.
    */

    /*
    Inizio Policy di contatto (N6)
    La notifica di inizio Policy di Contatto viene inviata dall’Operatore Wholesale di Rete all’Operatore A/A1, contestualmente all’esecuzione del primo tentativo di contatto (sia se effettuato on call che se effettuato in modalità virtuale).
    */

    /* 
    Espletamento (N7)
    La notifica di Espletamento viene inviata dall’Operatore Wholesale di Rete all’Operatore A/A1 per comunicare l’esito (positivo o negativo) di una richiesta di migrazione.
    Nella tabella seguente è riportato il set di informazioni necessarie per la richiesta.
    */

    /* 
    Richiesta verifica codice sessione (N8)
    La notifica di “Verifica codice sessione” viene inviata 
    dall’Operatore Wholesale di Rete (D) all’Operatore Donating (E/E1), per chiedere la verifica su:
        • correttezza e validità del codice sessione
        • correttezza delle numerazioni richieste dal Recipient
    Nella tabella seguente è riportato il set di informazioni necessarie per la richiesta.
    */


    /* 
    Esito verifica codice sessione (N9)
    La notifica di Aggiornamento stato è inviata 
    dall’Operatore di Rete Wholesale all’Operatore Recipient per notificare il cambio dello stato dell’ordine.
    I passaggi di stato notificati con tale notifica sono:
        • Acquisito
        • Acquisito KO
        • Accettato (comprende la verifica OK del codice sessione)
        • Accettato KO (comprende la verifica del codice sessione KO)
        • Sospeso
        • Annullato (a seguito dell’annullamento inviato dal Recipient)
    La notifica di “Accettato” ha anche valore di Comunicazione DAC nella prima notifica di accettazione.
    Nella tabella seguente è riportato il set di informazioni necessarie per la richiesta.*/

    /*La notifica di “riscontro codice sessione” viene inviata 
    dall’ Operatore Donating (E/E1) all’Operatore Wholesale di Rete Recipient (D) 
    per dare l’esito della verifica sulla correttezza e validità del codice sessione.
    Nella tabella seguente è riportato il set di informazioni necessarie per la richiesta.*/
    N9DonatingToWhlsCheckSession: {
        CODICE_ORDINE_WHS: { mandatory: 1 },  //Identificativo univoco attribuito alla richiesta di migrazione dall’Operatore Wholesale. di Rete.//Struttura: <CODICE_OPERATORE_WHS>_<codice univoco>, dove  <codice univoco> è un codice univoco definito dall’Operatore Wholesale di Rete
        ID_NOTIFICA: { mandatory: 1 },
        DATA_NOTIFICA: { mandatory: 1 },  //YYYY-MM-DDThh:mm:ssTZD 
        ESITO: { mandatory: 1 },  //ko oppure ok
        CODICE_MOTIVAZIONE: { mandatory: 0 },
        MOTIVAZIONE: { mandatory: 0 },
        NOTE: { mandatory: 0 },
    },

    /*
    Aggiornamento vs Donating (N10)
    L’Operatore Wholesale di Rete invia all’Operatore Donating E1/E le seguenti notifiche:
        • Comunicazione della prima DAC
        • Esito nella richiesta di migrazione OK oppure KO
        • Invio della richiesta di Annullamento ricevuta dal Recipient
    Nella tabella seguente è riportato il set di informazioni necessarie per la richiesta.
    */


    /*
    Comunicazione vs Donor (N11)
    Attraverso la Comunicazione vs Donor, l’Operatore Recipient A/A1 invia all’Operatore Donor:
            - la “Notifica preventiva NP”   
            - la “Notifica esecuzione NP” (espletamento migrazione OK)
            - la “Notifica di KO” (espletamento migrazione KO)
    Nella tabella seguente è riportato il set di informazioni necessarie per la richiesta.*/
    N11RecipientToDonatingDonorComunication: {
        CODICE_OPERATORE: { mandatory: 1 },
        CODICE_ORDINE_WHS: { mandatory: 1 },  //Identificativo univoco attribuito alla richiesta di migrazione dall’Operatore Wholesale. di Rete.//Struttura: <CODICE_OPERATORE_WHS>_<codice univoco>, dove  <codice univoco> è un codice univoco definito dall’Operatore Wholesale di Rete
        ID_NOTIFICA: { mandatory: 1 },
        DATA_NOTIFICA: { mandatory: 1 },  //YYYY-MM-DDThh:mm:ssTZD 
        TIPO_NOTIFICA: { mandatory: 1 },  //01 = Notifica preventiva di NP, 02 = Notifica esecuzione NP, 03 = Notifica KO
        NUMERAZIONI: { mandatory: 1 },  //obbligatorio se precedente di tipo 1
        DN: { mandatory: 1 },  //numero telefono
        NOTE: { mandatory: 0 },
    },

    /*Comunicazioni sincrone
    Di seguito sono riportate le altre tipologie di notifiche scambiate tra tutti gli operatori che partecipano al processo di migrazione FTTH.
    5.5.1 ACK/NACK sincrono di presa in carico (N12)
    Di seguito è riportato il tracciato dei messaggi sincroni di OK/KO di risposta a tutti i messaggi inviati in tutte le direzioni.
    Nella tabella seguente è riportato il set di informazioni necessarie per la richiesta.*/

    N12NotificatoinACK: {
        ID_NOTIFICA: { mandatory: 1 },
        ESITO: { mandatory: 1 },  //0 ACK (OK), 1 NoACK (KO)
        CODICE_MOTIVAZIONE: { mandatory: 1 },
        MOTIVAZIONE: { mandatory: 1 },
    },

    /*            5.4.2 Comunicazione dal Donor (N13)
    Attraverso la Comunicazione dal Donor, l’Operatore Donor invia all’Operatore Recipient A/A1:
            ◦ la “Notifica KO sulle numerazioni da portare”
    Nella tabella seguente è riportato il set di informazioni necessarie per la richiesta.
    */
    N13DonorToRecipientKO: {
        CODICE_OPERATORE: { mandatory: 1 },
        CODICE_ORDINE_WHS: { mandatory: 1 },  //Identificativo univoco attribuito alla richiesta di migrazione dall’Operatore Wholesale. di Rete.//Struttura: <CODICE_OPERATORE_WHS>_<codice univoco>, dove  <codice univoco> è un codice univoco definito dall’Operatore Wholesale di Rete
        ID_NOTIFICA: { mandatory: 1 },
        DATA_NOTIFICA: { mandatory: 1 },  //YYYY-MM-DDThh:mm:ssTZD 
        TIPO_NOTIFICA: { mandatory: 1 },  //01 = Notifica preventiva di NP, 02 = Notifica esecuzione NP, 03 = Notifica KO
        NUMERAZIONI_SCARTATE: { mandatory: 1 },  //obbligatorio se precedente di tipo 1
        DN: { mandatory: 1 },  //numero telefono
        CODICE_MOTIVAZIONE: { mandatory: 0 },
        MOTIVAZIONE: { mandatory: 0 },
        NOTE: { mandatory: 0 },
    }

}