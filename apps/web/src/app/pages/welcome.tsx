"use client";
/**
 * This is a minimal welcome page for the starter.
 *
 * _Feel free to delete this file_
 **/

import { useState } from "react";

import type { Note } from "@/app/notes/db";
import { MAX_NOTE_LENGTH } from "@/app/notes/db";
import { addNote, removeNote } from "@/app/notes/functions";

import styles from "./welcome.module.css";

export const Welcome = ({
  siteName,
  sourceUrl,
  notes,
}: {
  siteName: string;
  sourceUrl: string;
  /** null until the migrations have created the notes table. */
  notes: Note[] | null;
}) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome to {siteName}</h1>
        <p className={styles.subtitle}>
          You’ve just installed the starter project. Here’s what to do next.
        </p>
      </header>

      <main>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Next steps</h2>
          <ol className={styles.list}>
            <li>
              Read the{" "}
              <a
                href="https://docs.rwsdk.com/getting-started/quick-start/"
                target="_blank"
                rel="noreferrer"
                className={styles.link}
              >
                Quick Start
              </a>{" "}
              to learn the basics.
            </li>
            <li>
              Explore React Server Components and Server Functions in the{" "}
              <a
                href="https://docs.rwsdk.com/"
                target="_blank"
                rel="noreferrer"
                className={styles.link}
              >
                Docs
              </a>
              .
            </li>
            <li>
              Join the community to ask questions and share what you’re
              building.
            </li>
          </ol>
        </section>

        <Notes notes={notes} />

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Deploy to Cloudflare</h2>
          <p>
            RedwoodSDK runs on Cloudflare Workers. This project deploys itself:
            every merge to main ships stage, then prod.
          </p>
          <div className={styles.codeBlock}>
            <span className={styles.codePrompt}>$</span>
            <code className={styles.code}>git push origin main</code>
            <Copy textToCopy="git push origin main" />
          </div>
          <p>
            Need more detail? Read the{" "}
            <a
              href="https://docs.rwsdk.com/core/hosting/"
              target="_blank"
              rel="noreferrer"
              className={styles.link}
            >
              Cloudflare deployment guide
            </a>
            , or the{" "}
            <a href={sourceUrl} className={styles.link}>
              source
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
};

// Your first table: notes in the D1 database behind the DB binding, read by
// the server component that renders this page and written by two server
// functions.
const Notes = ({ notes }: { notes: Note[] | null }) => {
  if (notes === null) {
    return (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your first table</h2>
        <p role="alert" className={styles.notice}>
          The <code>notes</code> table does not exist yet. Deployed, db-migrate
          creates it before the Worker ships; locally, run{" "}
          <code>pnpm run db:migrate:local</code> in <code>apps/web</code>.
        </p>
      </section>
    );
  }
  return (
    <section className={styles.section} data-notes={notes.length}>
      <h2 className={styles.sectionTitle}>Your first table</h2>
      <p>
        Notes live in Cloudflare D1. This page reads them in a server
        component; the form below writes them through a server function.
      </p>
      <ul className={styles.notes}>
        {notes.map((note) => (
          <li key={note.id} className={styles.note}>
            <span>{note.body}</span>
            <form action={removeNote}>
              <button
                type="submit"
                name="id"
                value={note.id}
                className={styles.noteButton}
                aria-label={`Remove note ${note.id}`}
              >
                Remove
              </button>
            </form>
          </li>
        ))}
      </ul>
      <form action={addNote} className={styles.noteForm}>
        <input
          name="body"
          required
          maxLength={MAX_NOTE_LENGTH}
          placeholder="Write a note"
          aria-label="Note"
          className={styles.noteInput}
        />
        <button type="submit" className={styles.noteButton}>
          Add
        </button>
      </form>
    </section>
  );
};

const Copy = ({ textToCopy }: { textToCopy: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button onClick={handleCopy} className={styles.copyButton}>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
};
