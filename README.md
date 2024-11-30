# KidFuns

## Description

KidFuns is a family management app that allows parents to track and manage their children's weekly allowance. It includes features to assign allowance rates, view balances, and monitor transactions.

## Features

- Create and manage family profiles.
- Assign allowance rates to kids.
- Track weekly allowance updates.
- View kid's balance and transaction history.
- Secure authentication with Firebase.

## Tech Stack

- **Frontend**:
  - React
  - Redux
  - React Router
  - Firebase Authentication

- **Backend**:
  - Node.js with Express
  - RESTful API


- **Database**:
  - MariaDB

## Getting Started

To get this project up and running locally, follow these instructions:

### Prerequisites

You need Node.js and npm installed. If you haven't installed them, you can download and install from [here](https://nodejs.org/).

You will also need Firebase CLI installed. You can install it globally by running:

```
npm install -g firebase-tools
```

### Installation

1. Clone the repo:

```
git clone https://github.com/yourusername/KidFuns.git
```

2. Navigate into the project directory:

```
cd KidFuns
```

3. Install dependencies:

```
npm install
```

4. Set up Firebase:

- If you don't have a Firebase project, create one at [Firebase Console](https://console.firebase.google.com/).
- Initialize Firebase in your project:

```
firebase init
```

Follow the instructions to configure Firebase for your project, including setting up Firestore, Firebase Authentication, and Firebase Cloud Functions.

5. To run the development server:

```
npm start
```

### Deploying to Firebase

To deploy the app to Firebase, run:

```
firebase deploy
```

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.