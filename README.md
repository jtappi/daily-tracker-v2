# My Node.js Project

This app will track your daily activities of all sorts!

## Project Structure

```
my-nodejs-project
├── src
│   └── index.js
├── public
│   ├── index.html
│   ├── view-data.html
│   ├── script.js
│   ├── view-data.js
│   ├── styles.css
│   └── data.json
├── package.json
└── README.md
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