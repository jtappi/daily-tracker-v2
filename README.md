# TO DO
- Add the ability to upload a receipt
- Document DB instead of JSON
- Add up to three prefill values during search in the dropdown.  Only 1 on mobile maybe?
- if authenticated, change the back to login button to logout
- Fix the logout func.  it doesn't work as expected
- fix the analyze-data hide/view tabs. 
- fix the issue with the category and text fields always being visible.  
- add required fields before clicking submit or save on the edit screen
- add work category, or maybe travel, or should i just use google api???
- notes column needs to be updated to show all of the notes.  Maybe on the graph as well???
- refresh the top 5 after submission


# TO DO - Eisenhower Matrix
- Add restore func and make sure that it has a restore id, restored date and restore closed date
- Max entries into the 1stQuad should be 3, 2ndQuad 10, 3rdQuad 10, 4thQuad Unlimited
- When a quad is full, move it down to the next quad
- Add notes to the completed table
- Make the items movable (from one quad to another, within the quad, up or down)
- may need to move the one click to complete into a button or something
- show the start date in the quadrant

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