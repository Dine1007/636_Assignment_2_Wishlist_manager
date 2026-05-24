## Gift Wishlist Manager

### Overview

Gift Wishlist Manager is a web application that helps people to create and share their wish lists with friends and family members so they can buy a perfect gift without any duplicates or spoiled surprises.

**Live URL:** `http://3.25.51.201`

---

### User Story

Sarah is turning 30. She does not want to dictate to everybody on what to purchase but she wants useful gifts. She goes to Gift Wishlist Manager and Register and adds her name, email and password and her account is created. She is now logged in.
She hits the button Create Wishlist and calls it Sarah 30th Birthday. Then she clicks on Add Item and enters two items she desires Sony Headphones at a cost of 350 and The Alchemist book at a cost of 15. She even later on realizes that the price of the headphones has been lowered to $320 and as such, she clicks on Edit Item and changes the price. She also put in a yoga mat accidentally and so she clicks Delete Item and deletes it.
Her list is ready. She clicks Share Wishlist and pastes the individual link which the system provides. She forwards it to her WhatsApp friends.
Tom is given the connection and he taps. The app is able to do this without asking Tom to log in. He is in a position to view the items and their prices. He makes a purchase decision and clicks Reserve. Reservation requires an account which he registers and then logs in. The headphones have taken the label of Reserved. They are recorded as unavailable by other visitors. Sarah makes her own list and even considers it available, so there is no danger in her surprise.
Later on, Tom reverses his mind and clicks Un-reserve Item. The headphones become available again. His friend Jake(other guest) opens the connection and realizes that the headphones are free and books them instead.
Having purchased the headphones in the store Jake opens the app and presses Mark as Purchased. It has permanently shut down.
During Sarah's birthday she gets what she wanted without any duplicates and spoilt surprises.

---

Scope:
• User registration and login
• Create, edit (Amazon, n.d.)Wishlist
• Add items with name, price, URL, priority
• Share via unique link
• Reserve, unreserve and purchase individual items.
• Surprise protection for the owner

Owner - Main Functions

1. Owner registers with name, email and password
2. Owner logs in to access the system
3. Owner creates a wishlist with a name
4. Owner adds items with name, price, priority and URL
5. Owner edits item details when information changes
6. Owner deletes an item that is no longer needed
7. Owner shares the wishlist via a unique system-generated link
8. Owner views own list but never sees reserved or purchased status
9. Owner logs out to end the session

Guest - Main Functions

1. Guest views a shared wishlist without login
2. Guest registers and logs in when they want to reserve
3. Guest reserves an available item other guests see it as unavailable.
4. Guest un-reserves an item they no longer want. Item returns to available
5. Guest reserves an item that was released by another guest
6. Guest marks an item as purchased after buying it. Item is permanently closed
7. Guest logs out to end the session

---

### Tech Stack

| Layer           | Technology                          |
| --------------- | ----------------------------------- |
| Frontend        | React.js                            |
| Backend         | Node.js, Express.js                 |
| Database        | MongoDB Atlas (Mongoose ODM)        |
| Testing         | Mocha, Chai, Sinon                  |
| CI/CD           | GitHub Actions (self-hosted runner) |
| Deployment      | AWS EC2, PM2, Nginx                 |
| Version Control | Git & GitHub                        |

---

### CRUD Operations

| Operation  | Owner Actions                                   | Guest Actions                                    |
| ---------- | ----------------------------------------------- | ------------------------------------------------ |
| **Create** | Create wishlist, Add items                      | Register account                                 |
| **Read**   | View wishlists, View items (surprise protected) | View shared wishlist with real statuses          |
| **Update** | Edit wishlist name, Edit item details           | Reserve item, Un-reserve item, Mark as purchased |
| **Delete** | Delete wishlist, Delete items                   | —                                                |

---

## Testing

Unit tests are written using Mocha (test framework), Chai (assertions), and Sinon (mocking) to verify controller logic without connecting to the actual database.

### Test Suites

| Test Suite     | Test Cases                                                                      |
| -------------- | ------------------------------------------------------------------------------- |
| CreateWishlist | Successfully creates a wishlist, Returns 500 on error                           |
| GetMyWishlists | Returns wishlists for the user, Returns 500 on error                            |
| UpdateWishlist | Updates name successfully, Returns 404 if not found, Returns 500 on error       |
| DeleteWishlist | Deletes successfully, Returns 404 if not found, Returns 500 on error            |
| AddItem        | Adds item successfully, Returns 404 if wishlist not found, Returns 500 on error |
| DeleteItem     | Deletes successfully, Returns 404 if not found, Returns 500 on error            |

---

## CI/CD Pipeline

The project uses GitHub Actions with a self-hosted runner on AWS EC2 for automated testing and deployment.

### Pipeline Flow

```
Developer pushes to main -> GitHub Actions triggered -> Checkout code on EC2 runner -> Set up Node.js environment -> Install backend ->  dependencies -> Install frontend dependencies & build -> Run backend unit tests -> If tests pass → Deploy with PM2 ->App is live at http://3.25.51.201


## Starter Project

Extended from: [https://github.com/nahaQUT/sampleapp_IFQ636.git](https://github.com/nahaQUT/sampleapp_IFQ636.git)
```
# trigger
