import type { Employee } from "../types";

interface EmployeeCardProps {
  employee: Employee;
  showPrintButton?: boolean;
}

function getInitials(nama: string): string {
  return nama
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function QRCodeSVG({ value }: { value: string }) {
  const size = 7;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    const charCode = value.charCodeAt(i % value.length);
    cells.push((charCode + i) % 3 !== 0);
  }
  const cornerPositions = [
    0, 1, 2, 3, 4, 5, 6, 7, 13, 14, 20, 21, 27, 28, 34, 35, 41, 42, 43, 44, 45,
    46, 47, 48,
  ];
  for (const p of cornerPositions) {
    cells[p] = true;
  }

  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 70 70"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="QR Code"
    >
      <title>QR Code</title>
      {cells.map((filled, i) => {
        const row = Math.floor(i / size);
        const col = i % size;
        const key = `qr-${row}-${col}`;
        return filled ? (
          <rect
            key={key}
            x={col * 10}
            y={row * 10}
            width="8"
            height="8"
            fill="#0A2B45"
            rx="1"
          />
        ) : null;
      })}
    </svg>
  );
}

export default function EmployeeCard({
  employee,
  showPrintButton = true,
}: EmployeeCardProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ minHeight: "220px" }}
        id="employee-card-print"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #0E3B6E 0%, #1A6B5A 50%, #2FA66B 100%)",
          }}
        />

        <div
          className="relative z-10 flex items-center justify-between px-6 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}
        >
          <div className="flex items-center gap-2">
            <img
              src="/assets/logo_bkkbn-019d5e48-16d8-73fe-a725-df08e9261adf.jpg"
              alt="Logo DP2KBP3A"
              className="w-8 h-8 rounded-full object-contain"
              style={{ background: "white", padding: "2px" }}
            />
            <div>
              <div className="text-white font-bold text-sm tracking-widest">
                DP2KBP3A KAB SUBANG
              </div>
            </div>
          </div>
          <div className="text-white/80 text-xs font-semibold tracking-wider">
            KARTU PEGAWAI
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 px-6 py-5">
          {/* Foto atau Inisial */}
          <div className="flex-shrink-0">
            {employee.foto ? (
              <img
                src={employee.foto}
                alt={employee.nama}
                className="w-20 h-20 rounded-xl object-cover shadow-lg"
                style={{
                  border: "2px solid rgba(255,255,255,0.5)",
                }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "2px solid rgba(255,255,255,0.4)",
                }}
              >
                {getInitials(employee.nama)}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="text-white font-extrabold text-xl uppercase tracking-wider mb-1">
              {employee.nama}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs w-16">NIP</span>
                <span className="text-white text-xs font-mono">
                  {employee.nip}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs w-16">Jabatan</span>
                <span className="text-white text-xs">{employee.jabatan}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs w-16">Unit Kerja</span>
                <span className="text-white text-xs">{employee.unitKerja}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
                  style={{ background: "#2FA66B", color: "white" }}
                >
                  ● {employee.status}
                </span>
              </div>
            </div>
          </div>

          <div
            className="flex-shrink-0 p-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.9)" }}
          >
            <QRCodeSVG value={employee.nip} />
            <div className="text-center text-[9px] text-gray-500 mt-1 font-mono">
              {employee.nip}
            </div>
          </div>
        </div>

        <div
          className="relative z-10 px-6 py-2 text-[10px] text-white/60 flex justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
        >
          <span>E-ABSENSI</span>
          <span>Tahun {new Date().getFullYear()}</span>
        </div>
      </div>

      {showPrintButton && (
        <button
          type="button"
          data-ocid="kartu.print.button"
          onClick={handlePrint}
          className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors"
          style={{ background: "#2E7BC6" }}
        >
          🖨️ Cetak / Download Kartu
        </button>
      )}
    </div>
  );
}
