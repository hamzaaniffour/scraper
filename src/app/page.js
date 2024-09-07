"use client";
// src/app/page.js

import React, { useState } from 'react';

const Page = () => {
  const [keyword, setKeyword] = useState('');
  const [emails, setEmails] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      });

      const data = await response.json();
      if (response.ok) {
        setEmails(data.emails);
      } else {
        console.error('Error:', data.error);
        setEmails([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setEmails([]);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter keyword"
        />
        <button type="submit">Search</button>
      </form>
      <ul>
        {emails.length > 0 ? (
          emails.map((email, index) => (
            <li key={index}>{email}</li>
          ))
        ) : (
          <li>No emails found</li>
        )}
      </ul>
    </div>
  );
};

export default Page;