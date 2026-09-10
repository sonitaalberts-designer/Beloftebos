import sqlite3, pathlib, unittest, threading, tempfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
class InventoryTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.path=self.tmp.name+'/test.db';self.db=sqlite3.connect(self.path)
  self.db.executescript((ROOT/'drizzle/0001_initial.sql').read_text());self.db.executescript((ROOT/'drizzle/0003_function_blocks.sql').read_text())
  for table,id in [('rooms','room'),('guests','guest')]:self.db.execute(f"INSERT INTO {table}(id,data,created_at,updated_at) VALUES(?,'{{}}','now','now')",(id,))
  self.db.commit()
 def tearDown(self):self.db.close();self.tmp.cleanup()
 def reserve(self,id,start='2027-01-01',end='2027-01-03',status='CONFIRMED'):
  self.db.execute("INSERT INTO bookings(id,room_id,guest_id,checkin,checkout,status,source,data,created_at,updated_at) VALUES(?,'room','guest',?,?,?,'DIRECT','{}','now','now')",(id,start,end,status));self.db.commit()
 def test_overlap_rejected(self):
  self.reserve('a')
  with self.assertRaises(sqlite3.IntegrityError):self.reserve('b','2027-01-02','2027-01-04')
 def test_adjacent_checkout_allowed(self):self.reserve('a');self.reserve('b','2027-01-03','2027-01-04')
 def test_cancelled_frees_inventory(self):self.reserve('a',status='CANCELLED');self.reserve('b')
 def test_move_detects_conflict(self):
  self.reserve('a');self.reserve('b','2027-01-03','2027-01-05')
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute("UPDATE bookings SET checkin='2027-01-02' WHERE id='b'")
 def test_block_detects_booking(self):
  self.reserve('a')
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute("INSERT INTO availability_blocks(id,room_id,checkin,checkout,source,data,created_at,updated_at) VALUES('block','room','2027-01-02','2027-01-04','ADMIN','{}','now','now')")
 def test_booking_detects_block(self):
  self.db.execute("INSERT INTO availability_blocks(id,room_id,checkin,checkout,source,data,created_at,updated_at) VALUES('block','room','2027-01-02','2027-01-04','ADMIN','{}','now','now')");self.db.commit()
  with self.assertRaises(sqlite3.IntegrityError):self.reserve('a')
 def test_invalid_range(self):
  with self.assertRaises(sqlite3.IntegrityError):self.reserve('a','2027-01-03','2027-01-01')
 def test_concurrent_writers(self):
  result=[]
  def worker(id):
   conn=sqlite3.connect(self.path,timeout=5)
   try:conn.execute("INSERT INTO bookings(id,room_id,guest_id,checkin,checkout,status,source,data,created_at,updated_at) VALUES(?,'room','guest','2027-01-01','2027-01-03','CONFIRMED','DIRECT','{}','now','now')",(id,));conn.commit();result.append('success')
   except sqlite3.IntegrityError:result.append('conflict')
   finally:conn.close()
  threads=[threading.Thread(target=worker,args=(str(i),)) for i in range(8)]
  for t in threads:t.start()
  for t in threads:t.join()
  self.assertEqual(result.count('success'),1);self.assertEqual(result.count('conflict'),7)
if __name__=='__main__':unittest.main(verbosity=2)
