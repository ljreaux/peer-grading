import * as SQLite from 'expo-sqlite';
import { SECTION_LIST_MOCK_DATA } from './utils';

const db = SQLite.openDatabase('little_lemon');

export async function createTable() {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'create table if not exists menuitems (id integer primary key not null, uuid text, title text, price text, category text);',
          [],
          () => {
            resolve();
          },
          (_, error) => {
            reject(new Error('Failed to create table: ' + error.message));
          }
        );
      },
      reject
    );
  });
}

export async function getMenuItems() {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'select * from menuitems',
          [],
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => {
            reject(new Error('Failed to fetch menu items: ' + error.message));
          }
        );
      },
      reject
    );
  });
}

export function saveMenuItems(menuItems) {
  db.transaction((tx) => {
    const values = menuItems.map(({ id, uuid, title, price, category }) => {
      return `(${id}, '${uuid}', '${title}', '${price}', '${category}')`;
    }).join(',');

    const sqlStatement = `INSERT INTO menuitems (id, uuid, title, price, category) VALUES ${values};`;

    tx.executeSql(
      sqlStatement,
      [],
      () => {
        console.log('Menu items saved successfully');
      },
      (error) => {
        console.error('Failed to save menu items', error);
      }
    );
  });
}

export async function filterByQueryAndCategories(query, activeCategories) {
  return new Promise((resolve, reject) => {
    let sqlStatement = 'SELECT * FROM menuitems WHERE ';

    sqlStatement += `title LIKE '%${query}%'`;

    if (activeCategories.length > 0) {
      sqlStatement += ' AND (';
      sqlStatement += activeCategories.map(category => `category = '${category}'`).join(' OR ');
      sqlStatement += ')';
    }

    db.transaction((tx) => {
      tx.executeSql(
        sqlStatement,
        [],
        (_, { rows }) => {
          resolve(rows._array);
        },
        (error) => {
          reject(new Error(`Failed to filter menu items: ${error.message}`));
        }
      );
    });
  });
}