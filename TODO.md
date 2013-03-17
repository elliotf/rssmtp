# stories

* user can remove a feed
* user sees a footer at the bottom of every email
  * to unsubscribe from the feed the item is in
  * to manage their account
* user can filter emails
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
