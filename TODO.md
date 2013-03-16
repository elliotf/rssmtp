# stories

* user can remove a feed
* when a new item comes in to a feed
  * periodically check each feed
    * use feeds to track state
    * to get work
      * attempt feed lock aquisition
        * find feed that was started more than N seconds ago
        * attempt to update feed
          * set started timestamp
          * set worker to host/pid identifier
  * users that are subscribed to that feed get an email
* user sees a footer at the bottom of every email
  * to unsubscribe from the feed the item is in
  * to manage their account
* user can filter rss-email-gw emails
  * via envelope sender
  * via message header sender
  * via mail header
    * List-ID
    * Mailing-list
    * List-Help
    * List-Subscribe

* Models
  * Feed
    * prior lastModified
    * prior etag
    * uri
    * name
    * recent articles (N most recent?)
    * #update
      * get feed not updated in the last 30min
      * for every article in update
        * if we have not seen this article
          * for every User that has this feed
            * send the article as an html email
  * User
    * email
    * accounts
      * provider
      * id
    * Feeds
