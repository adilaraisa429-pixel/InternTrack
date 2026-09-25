import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Message, Student, Supervisor } from '../../types';
import {
  Send,
  User,
  Search,
  MessageSquare,
  Check,
  CheckCheck,
  Building2,
  Paperclip,
  Sparkles,
} from 'lucide-react';

interface ChatViewProps {
  initialRecipientId?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ initialRecipientId }) => {
  const { currentUser, messages, sendMessage, students, supervisors, companies } = useApp();

  const [recipientId, setRecipientId] = useState<string>('');
  const [textInput, setTextInput] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!currentUser) return null;

  // Determine possible contacts based on role
  let contacts: Array<{ id: string; name: string; avatar: string; subtitle: string; role: string }> = [];

  if (currentUser.role === 'siswa') {
    const student = currentUser as Student;
    const sup = supervisors.find((s) => s.id === student.supervisorId);
    if (sup) {
      contacts.push({
        id: sup.id,
        name: sup.name,
        avatar: sup.avatar,
        subtitle: `${sup.position} &bull; ${sup.department}`,
        role: 'Pembimbing',
      });
    }
    // Also allow talking to other supervisors or school admin
    supervisors
      .filter((s) => s.id !== student.supervisorId)
      .forEach((s) => {
        contacts.push({
          id: s.id,
          name: s.name,
          avatar: s.avatar,
          subtitle: s.position,
          role: 'Pembimbing',
        });
      });
  } else if (currentUser.role === 'pembimbing') {
    const supervisor = currentUser as Supervisor;
    // Supervised students first
    const myStudents = students.filter((s) => s.supervisorId === supervisor.id);
    myStudents.forEach((s) => {
      const comp = companies.find((c) => c.id === s.companyId);
      contacts.push({
        id: s.id,
        name: s.name,
        avatar: s.avatar,
        subtitle: `${s.className} &bull; ${comp?.name || 'Magang'}`,
        role: 'Siswa',
      });
    });
    // Other students
    students
      .filter((s) => s.supervisorId !== supervisor.id)
      .forEach((s) => {
        contacts.push({
          id: s.id,
          name: s.name,
          avatar: s.avatar,
          subtitle: s.className,
          role: 'Siswa',
        });
      });
  } else {
    // Admin can chat with any student or supervisor
    supervisors.forEach((s) => {
      contacts.push({
        id: s.id,
        name: s.name,
        avatar: s.avatar,
        subtitle: s.position,
        role: 'Pembimbing',
      });
    });
    students.forEach((s) => {
      contacts.push({
        id: s.id,
        name: s.name,
        avatar: s.avatar,
        subtitle: s.className,
        role: 'Siswa',
      });
    });
  }

  // Set active contact
  useEffect(() => {
    if (initialRecipientId && contacts.some((c) => c.id === initialRecipientId)) {
      setRecipientId(initialRecipientId);
    } else if (!recipientId && contacts.length > 0) {
      setRecipientId(contacts[0].id);
    }
  }, [initialRecipientId, contacts]);

  const activeContact = contacts.find((c) => c.id === recipientId);

  // Filter messages between current user and active contact
  const conversationMessages = messages
    .filter(
      (m) =>
        (m.senderId === currentUser.id && m.receiverId === recipientId) ||
        (m.senderId === recipientId && m.receiverId === currentUser.id)
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !recipientId) return;

    sendMessage(recipientId, textInput.trim());
    setTextInput('');
  };

  const handleQuickTemplate = (tpl: string) => {
    setTextInput(tpl);
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchContact.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-[calc(100vh-170px)] min-h-[550px] flex flex-col md:flex-row">
      {/* Contact List Sidebar (Left) */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Pesan & Komunikasi Bimbingan</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kontak pembimbing/siswa..."
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredContacts.map((contact) => {
            const isSelected = contact.id === recipientId;
            // Get last message
            const lastMsg = messages
              .filter(
                (m) =>
                  (m.senderId === currentUser.id && m.receiverId === contact.id) ||
                  (m.senderId === contact.id && m.receiverId === currentUser.id)
              )
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

            return (
              <button
                key={contact.id}
                onClick={() => setRecipientId(contact.id)}
                className={`w-full text-left p-3.5 flex items-center gap-3 transition-colors ${
                  isSelected ? 'bg-blue-50/90 border-l-4 border-blue-600' : 'hover:bg-white'
                }`}
              >
                <div className="relative">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5"></span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{contact.name}</h4>
                    {lastMsg && (
                      <span className="text-[10px] text-slate-400">
                        {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-[11px] text-slate-500 truncate"
                    dangerouslySetInnerHTML={{ __html: contact.subtitle }}
                  ></p>
                  {lastMsg && (
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">
                      {lastMsg.senderId === currentUser.id ? 'Anda: ' : ''}
                      {lastMsg.message}
                    </p>
                  )}
                </div>
              </button>
            );
          })}

          {filteredContacts.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">Kontak tidak ditemukan.</div>
          )}
        </div>
      </div>

      {/* Active Conversation Chat Room (Right) */}
      <div className="flex-1 flex flex-col bg-white">
        {activeContact ? (
          <>
            {/* Chat Room Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <img
                  src={activeContact.avatar}
                  alt={activeContact.name}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{activeContact.name}</h4>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Online &bull; {activeContact.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
              {conversationMessages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Mulai Percakapan Bimbingan</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Kirim pesan seputar kegiatan magang, klarifikasi tugas, atau pertanyaan jurnal.
                  </p>
                </div>
              )}

              {conversationMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                          isMe ? 'text-blue-200' : 'text-slate-400'
                        }`}
                      >
                        <span>{time}</span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-200" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Templates */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] text-slate-400 font-semibold shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Saran:
              </span>
              {currentUser.role === 'siswa' ? (
                <>
                  <button
                    onClick={() => handleQuickTemplate('Selamat pagi Pak/Bu, jurnal hari ini telah saya submit.')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium border border-slate-200 shrink-0 whitespace-nowrap"
                  >
                    Jurnal telah di-submit
                  </button>
                  <button
                    onClick={() => handleQuickTemplate('Mohon izin bertanya mengenai kendala teknis pada proyek hari ini.')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium border border-slate-200 shrink-0 whitespace-nowrap"
                  >
                    Tanya kendala teknis
                  </button>
                  <button
                    onClick={() => handleQuickTemplate('Revisi jurnal sudah saya perbaiki dan kirim ulang.')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium border border-slate-200 shrink-0 whitespace-nowrap"
                  >
                    Revisi sudah diperbaiki
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleQuickTemplate('Bagus, lanjutkan dan tetap jaga etos kerja di industri.')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium border border-slate-200 shrink-0 whitespace-nowrap"
                  >
                    Bagus, lanjutkan
                  </button>
                  <button
                    onClick={() => handleQuickTemplate('Tolong lengkapi foto dokumentasi pada jurnal kemarin ya.')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium border border-slate-200 shrink-0 whitespace-nowrap"
                  >
                    Lengkapi dokumentasi
                  </button>
                </>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                id="input-chat-message"
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Ketik pesan untuk ${activeContact.name}...`}
                className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <button
                type="submit"
                id="btn-send-chat"
                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors"
                title="Kirim Pesan"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-xs">Pilih kontak di sebelah kiri untuk membuka obrolan.</p>
          </div>
        )}
      </div>
    </div>
  );
};
