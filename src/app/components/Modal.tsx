"use client";
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: ()=>void; title: string; children: React.ReactNode }){
  if(!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">{title}</div>
        <div className="modal-content">{children}</div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-primary">OK</button>
        </div>
      </div>
    </div>
  );
}
