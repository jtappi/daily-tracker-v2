# TO DO
Add the abilit to delete an entry (with a confirmation)
Hide the login password that is visible under Authenticate
Add the ability to upload a receipt
Add the ability to alter the timestamp when submitting a new item
Update the UI to ensure that I see the EST times
Ability to alter the whole entry
Document DB instead of JSON

# My Node.js Project

This app will track your daily activities of all sorts!

## Project Structure

```
/path/to/your/project
├── .env
├── package.json
├── src
│   └── index.js
└── public
    ├── login.html
    ├── login.js
    ├── index.html
    ├── script.js
    ├── styles.css
    ├── favicon.ico
    ├── jquery-3.5.1.min.js
    ├── popper.min.js
    └── bootstrap.min.js
```

## Getting Started

To get started with this project, follow these steps:

1. **Clone the repository** (if applicable):
   ```
   git clone <repository-url>
   ```

2. **Navigate to the project directory**:
   ```
   cd my-nodejs-project
   ```

3. **Install dependencies**:
   ```
   npm install
   ```

4. **Run the application**:
   ```
   npm start
   ```

## Categories

The application supports the following categories for items:

- Home
- Medication
- Bill
- Health
- Pain

These categories can be selected when adding a new item.

## Filtering Data

On the "View All Data" page, you can filter the displayed data by selecting a specific item name from the dropdown at the top of the page.

## Data Structure

The data is stored in a JSON file (`data.json`) with the following structure for each entry:

```json
{
  "text": "Item Name",
  "category": "Category",
  "cost": "Cost",
  "notes": "Notes",
  "day": "Day of the Week",
  "month": "Month",
  "time": "Time",
  "timestamp": "ISO Timestamp"
}
```

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.