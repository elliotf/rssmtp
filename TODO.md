# stories

* user can remove a feed
* when the user enters the url of a website instead of feed
  * give them feedback that they should provide a feed url
  * LATER: get the page and look for an RSS link/header
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
* when a new user adds an existing up-to-date feed
  * they recieve the last N days of articles

* Models
  * Feed
    * prior lastModified
    * prior etag
