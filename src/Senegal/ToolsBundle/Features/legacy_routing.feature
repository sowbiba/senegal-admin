# language: fr
Fonctionnalité: Test de l'affichage de toute les pages legacy
  Afin d'assurer que tout les pages du legacy marche
  En tant qu'utilisateur admin
  Je dois accéder à chaque page sans constaté d'erreur
    Plan du Scénario: la page n'est pas en erreurs
      Etant donné que je suis connecté avec le pseudo "p_jessica" et le mot de passe "p4jessica"
      Quand je vais sur "<route>"
      Alors je devrais être sur "<route>"

    Exemples:
      | route                       |
      | /fonds                      |
      | /societes                   |
      | /groupesocietes             |
      | /companyAffiliation         |
      | /societesTypes              |
      | /news                       |
      | /typenews                   |
      | /letters                    |
      | /correspondants/panelcorres |
      | /correspondants/inwait      |
      | /correspondants/contrats    |
      | /correspondants/listcorres  |
      | /export/magExport           |
      | /guides                     |
      | /minisite                   |
      | /sfGuardUser                |
      | /sfGuardUser/profile        |
      | /connections                |
      | /invoice                    |
      | /reporting                  |
      | /reporting/emailing         |
      | /importation                |
      | /bi_report                  |
      | /etoilesmd                  |
      | /categoriemd                |
      | /flagschamps                |
      | /flagscontrats              |
      | /champs/formulaTesterTool   |
      | /market                     |
      | /gammes                     |
      | /documentsnature            |
      | /listesvaleur               |
      | /valeurs                    |
      | /pays                       |
      | /contractFake               |
      | /area                       |
      | /invoiceAreaData            |