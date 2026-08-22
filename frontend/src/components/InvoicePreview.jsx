import React from 'react';

const InvoicePreview = React.forwardRef(({ data, totaux }, ref) => {
  const numFacture = data?.numFacture || `000`;
  const categories = data?.categories || [];
  
  const dateObj = data?.dateFacture ? new Date(data.dateFacture) : new Date();
  const dateFactureStr = dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <div className="bg-white font-sans text-slate-800" ref={ref}>
      <div className="w-[210mm] min-h-[297mm] mx-auto bg-white relative flex flex-col overflow-hidden text-[13px]">
        
        {/* Header Background Waves */}
        <div className="absolute top-0 left-0 w-full h-[280px] z-0 pointer-events-none">
          <svg viewBox="0 0 1000 280" className="w-full h-full" preserveAspectRatio="none">
            {/* Red shape */}
            <path d="M0,0 L1000,0 L1000,100 C700,40 450,280 0,230 Z" fill="#bd1228" />
            {/* Dark Blue shape */}
            <path d="M0,0 L1000,0 L1000,70 C700,20 450,250 0,195 Z" fill="#1e2243" />
          </svg>
        </div>

        {/* Header Content */}
        <div className="relative z-10 px-12 pt-12 flex justify-between items-start">
          {/* Left side: Invoice Title */}
          <div className="mt-8">
            <h1 className="text-white text-3xl font-bold tracking-wider">Facture n° {numFacture}</h1>
            <div className="mt-[150px] font-bold text-xl text-[#1e2243]">
              Client: {data?.client?.nom || 'Nom du client'}
            </div>
          </div>

          {/* Right side: Logo & Contact */}
          <div className="flex flex-col items-end text-[#1e2243] text-right mt-[80px]">
            <div className="flex justify-end items-center gap-2 mb-4">
              <img src="/logo_minane_cargo.png" alt="Minane Cargo" className="h-16 w-auto object-contain" onError={(e) => { e.target.style.display = 'none' }} />
              <img src="/logo2_minane_cargo.png" alt="Minane Cargo Text" className="h-10 w-auto object-contain" onError={(e) => { e.target.style.display = 'none' }} />
            </div>
            <div className="text-[12px] font-medium leading-snug mb-4 text-right">
              Room C12, 3/F Yidong Building,<br />
              No. 301 Huanshi Zhong Road,<br />
              Guangzhou<br />
              Tel : +86 137 1104 5051<br />
              +221 70 596 12 76
            </div>
            {/* Badge */}
            <div className="border-[1.5px] border-[#bd1228] text-[#1e2243] rounded-full px-5 py-1.5 text-xs font-bold tracking-wider flex gap-4 bg-white shadow-sm">
              <span>Guangzhou</span>
              <span className="text-[#1e2243]/60">to</span>
              <span>Dakar</span>
            </div>
          </div>
        </div>

        {/* Main Content Space */}
        <div className="flex-1 px-12 pt-20 relative z-10">
          
          {/* Table Header */}
          <div className="border border-[#bd1228] rounded-full flex font-bold text-[#1e2243] text-sm py-2 px-6 mb-8 tracking-wide">
            <div className="flex-[2] text-left">Description</div>
            <div className="flex-1 text-center">CTN</div>
            <div className="flex-1 text-center">CBM</div>
            <div className="flex-[1.5] text-right">Total HT</div>
          </div>

          {/* Table Body */}
          <div className="flex flex-col min-h-[150px] px-6 text-[#1e2243] text-[13px]">
            {categories.map((cat, catIndex) => (
              <React.Fragment key={catIndex}>
                {cat.articles?.map((article, artIndex) => {
                  const montant = parseFloat(article.montantHT) || 0;
                  const ctn = article.ctn || '';
                  const cbm = article.cbm || '';

                  if (!article.designation && montant === 0 && !ctn && !cbm) return null;

                  return (
                    <div key={`${catIndex}-${artIndex}`} className="flex mb-4 items-start">
                      <div className="flex-[2] text-left pr-4 whitespace-pre-wrap">{article.designation}</div>
                      <div className="flex-1 text-center">{ctn}</div>
                      <div className="flex-1 text-center">{cbm}</div>
                      <div className="flex-[1.5] text-right">{montant ? `${montant.toLocaleString('fr-FR')} FCFA` : ''}</div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Totals & Taxes */}
          <div className="mt-8 flex flex-col items-end text-[#1e2243] text-sm font-semibold tracking-wide pr-6 space-y-2">
            <div className="flex w-64 justify-between">
              <span className="text-gray-500">Total TTC</span>
              <span>{totaux?.total?.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

          {/* Bold Total Red Bar */}
          <div className="bg-[#bd1228] rounded-full text-white flex justify-between items-center py-3 px-8 mt-6 mb-20 font-bold text-lg">
            <span>Total</span>
            <span>{totaux?.total?.toLocaleString('fr-FR')} FCFA</span>
          </div>

          {/* Date & Signature Block */}
          <div className="flex justify-end mt-12 pr-4 pb-12">
            <div className="border border-[#bd1228] rounded-xl w-72 p-6 flex flex-col gap-6 text-[#1e2243]">
              <div className="flex justify-between items-center font-bold text-sm">
                <span>Date:</span>
                <span>{dateFactureStr}</span>
              </div>
              <div className="flex justify-between items-start font-bold text-sm min-h-[60px]">
                <span>Signature:</span>
                <img src="/signature.png" alt="Signature" className="h-12 w-auto object-contain mt-1 mr-2" onError={(e) => { e.target.style.display = 'none' }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

export default InvoicePreview;
