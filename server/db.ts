import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
const dbPath = path.join(dataDir, 'xijian.sqlite')

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

export const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      style TEXT NOT NULL,
      area REAL NOT NULL,
      layout TEXT NOT NULL,
      city TEXT NOT NULL,
      budget REAL NOT NULL,
      duration INTEGER NOT NULL,
      cover TEXT NOT NULL,
      images TEXT NOT NULL,
      before_img TEXT,
      after_img TEXT,
      designer_id TEXT NOT NULL,
      summary TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS designers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      avatar TEXT NOT NULL,
      years INTEGER NOT NULL,
      styles TEXT NOT NULL,
      layouts TEXT NOT NULL,
      budget_min REAL NOT NULL,
      budget_max REAL NOT NULL,
      rating REAL NOT NULL,
      review_count INTEGER NOT NULL,
      city TEXT NOT NULL,
      bio TEXT NOT NULL,
      works TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      author TEXT NOT NULL,
      designer_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      text TEXT NOT NULL,
      photos INTEGER NOT NULL,
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_plan TEXT NOT NULL,
      budget_total REAL NOT NULL,
      budget_used REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'normal',
      weather TEXT NOT NULL DEFAULT '晴 18°C'
    );

    CREATE TABLE IF NOT EXISTS stages (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      plan_date TEXT NOT NULL,
      actual_date TEXT,
      status TEXT NOT NULL,
      owner TEXT NOT NULL,
      photo TEXT,
      note TEXT,
      accepted INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS zones (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      x REAL NOT NULL,
      y REAL NOT NULL,
      w REAL NOT NULL,
      h REAL NOT NULL,
      status TEXT NOT NULL,
      stage_name TEXT,
      photo TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS site_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      ts TEXT NOT NULL,
      message TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      stock INTEGER NOT NULL,
      consumed INTEGER NOT NULL,
      alert INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS health_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      day TEXT NOT NULL,
      planned REAL NOT NULL,
      actual REAL NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS quality_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      dimension TEXT NOT NULL,
      score REAL NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS acceptances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      designer_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      from_case TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id TEXT,
      area REAL NOT NULL,
      phone TEXT NOT NULL,
      estimate_min REAL NOT NULL,
      estimate_max REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `)
}
