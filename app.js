const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');  // Statik dosyalar için gerekli

// Express uygulamasını oluştur
const app = express();

// CORS'u etkinleştir
app.use(cors());

// JSON verilerini parse etmek için middleware
app.use(express.json());

// MongoDB bağlantı dizesi (gerçek bağlantı dizesini kullanın)
const uri = 'mongodb+srv://alp:1@cluster0.hgrhp.mongodb.net/iletisim?retryWrites=true&w=majority&appName=Cluster0';

// MongoDB'ye bağlan
mongoose.connect(uri)
  .then(() => console.log('MongoDB\'ye bağlanıldı'))
  .catch(err => console.log('MongoDB\'ye bağlanırken hata:', err));

// 'messages' koleksiyonu için Mongoose şeması tanımla
const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,  // Eğer "subject" alanı varsa
  message: String,
  date: { type: Date, default: Date.now }
});

// 'messages' koleksiyonu için Mongoose modelini oluştur
const Message = mongoose.model('Message', messageSchema, 'messages');  // Koleksiyon adı 'messages'

// 'messages' koleksiyonundaki tüm verileri almak için API endpoint'i
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find();  // Tüm mesajları getir
    res.json(messages);  // Mesajları JSON olarak gönder
  } catch (err) {
    res.status(500).json({ message: 'Mesajlar alınırken hata oluştu', error: err });
  }
});

// 'messages' koleksiyonundan bir mesajı güncellemek için API endpoint'i
app.put('/api/messages/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, subject, message } = req.body;

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { name, email, subject, message },
      { new: true }  // Güncellenmiş mesajı döndür
    );
    
    if (!updatedMessage) {
      return res.status(404).json({ message: 'Mesaj bulunamadı' });
    }
    
    res.json(updatedMessage);  // Güncellenmiş mesajı JSON olarak gönder
  } catch (err) {
    res.status(500).json({ message: 'Mesaj güncellenirken hata oluştu', error: err });
  }
});

// 'messages' koleksiyonundan bir mesajı silmek için API endpoint'i
app.delete('/api/messages/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMessage = await Message.findByIdAndDelete(id);
    
    if (!deletedMessage) {
      return res.status(404).json({ message: 'Mesaj bulunamadı' });
    }
    
    res.json({ message: 'Mesaj başarıyla silindi' });
  } catch (err) {
    res.status(500).json({ message: 'Mesaj silinirken hata oluştu', error: err });
  }
});

// Statik dosyaları sunmak için 'public' klasörünü kullan
app.use(express.static(path.join(__dirname, 'public')));

// Sunucunun çalışacağı portu tanımla
const PORT = process.env.PORT || 3000;

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
