import test from 'node:test';
import assert from 'node:assert/strict';
import { readDump, parseRows, statements } from '../scripts/mysql-dump.mjs';
import { unserialize } from '../scripts/php-serialization.mjs';

test('MySQL backup parsing preserves escaped editorial data and ignores comments/unselected tables', () => {
  const sql = "-- comment\nCREATE TABLE `wp_posts` (\n `ID` bigint,\n `post_content` longtext\n);\nINSERT INTO `wp_posts` VALUES (7,'quote\\' and ; -- text\\nnext'),(8,'doubled '' quote'); /* ; ignored */ INSERT INTO `other_users` VALUES ('secret');";
  assert.deepEqual(readDump(sql, 'wp_'), { posts: [{ ID: '7', post_content: "quote' and ; -- text\nnext" }, { ID: '8', post_content: "doubled ' quote" }] });
  assert.deepEqual(parseRows('(NULL,0x6869,_binary\'x\')', ['a', 'b', 'c']), [{ a: null, b: 'hi', c: 'x' }]);
  assert.throws(() => [...statements("INSERT INTO x VALUES ('truncated")], /Unterminated/);
  assert.throws(() => parseRows("(1,'two')", ['only']), /Column count/);
});

test('PHP attachment metadata uses UTF-8 byte lengths and rejects unsafe object data', () => {
  assert.deepEqual(unserialize('a:2:{s:4:"file";s:6:"é.png";s:5:"sizes";a:0:{}}'), { file: 'é.png', sizes: [] });
  assert.deepEqual(unserialize('a:2:{i:0;s:3:"PHP";i:1;s:3:"Vue";}'), ['PHP', 'Vue']);
  assert.throws(() => unserialize('s:5:"é.png";'), /length/);
  assert.throws(() => unserialize('O:1:"X":0:{}'), /Unsupported/);
});
