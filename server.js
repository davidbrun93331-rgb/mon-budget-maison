const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// --- CONNEXION CLOUD ---
const mongoURI = "mongodb+srv://davidbrun93331_db_user:8BW0fVLSWtWfYYiq@cluster0.ddjofur.mongodb.net/budgetDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Connecté au Cloud MongoDB !"))
  .catch(err => console.error("❌ Erreur de connexion :", err));

// Schéma des données
const Transaction = mongoose.model('Transaction', {
    date: String,
    libelle: String,
    montant: Number,
    categorie: String
});

app.use(express.json());
app.use(express.static('public'));

// API : Récupérer tout
app.get('/api/historique', async (req, res) => {
    try {
        const docs = await Transaction.find().sort({ date: -1, _id: -1 });
        res.json(docs);
    } catch (e) { res.status(500).send(e); }
});

// API : Stats
app.get('/api/stats', async (req, res) => {
    try {
        const docs = await Transaction.find();
        const stats = {};
        docs.forEach(d => {
            stats[d.categorie] = (stats[d.categorie] || 0) + d.montant;
        });
        res.json(stats);
    } catch (e) { res.status(500).send(e); }
});

// API : Ajouter
app.post('/api/transaction', async (req, res) => {
    const t = new Transaction(req.body);
    await t.save();
    res.json({ success: true });
});

// API : Modifier
app.put('/api/transaction/:id', async (req, res) => {
    await Transaction.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
});

// API : Supprimer
app.delete('/api/transaction/:id', async (req, res) => {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur prêt sur http://localhost:${PORT}`);
});
