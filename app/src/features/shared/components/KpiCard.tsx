import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';

interface KpiCardProps {
  titulo: string;
  valor: string | number;
  iconClass: string;
  accentColor: string;
  iconBg: string;
  iconColor: string;
  variacion?: number | null;
  subtitulo?: string;
  alerta?: boolean;
}

export const KpiCard = ({
  titulo,
  valor,
  iconClass,
  accentColor,
  iconBg,
  iconColor,
  variacion,
  subtitulo,
  alerta
}: KpiCardProps) => (
  <Card
    className={`shadow-1 h-full ${alerta ? 'border-red-500' : ''}`}
    style={{ borderTop: `4px solid ${alerta ? 'var(--red-500)' : accentColor}`, borderRadius: '12px' }}
  >
    <div className="flex items-start justify-between mb-3">
      <span className="text-xs font-semibold uppercase tracking-wider leading-tight" style={{ color: 'var(--text-color-secondary)' }}>
        {titulo}
      </span>
      <span
        className="w-10 h-10 flex items-center justify-center"
        style={{ backgroundColor: alerta ? 'var(--red-50)' : iconBg, borderRadius: '10px' }}
      >
        <i className={`pi ${iconClass} text-lg`} style={{ color: alerta ? 'var(--red-500)' : iconColor }} />
      </span>
    </div>
    <div className={`text-2xl font-bold mb-1 ${alerta ? 'text-red-500' : ''}`} style={{ color: alerta ? undefined : 'var(--text-color)' }}>{valor}</div>
    {subtitulo && (
      <div className="text-[10px] font-medium truncate mb-2" style={{ color: 'var(--text-color-secondary)' }}>
        {subtitulo}
      </div>
    )}
    
    {(variacion !== undefined || variacion === null) && <Divider className="my-2" />}
    
    {variacion !== undefined && variacion !== null ? (
      <div className={`flex items-center gap-1 text-[10px] font-bold ${variacion >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
        <i className={`pi ${variacion >= 0 ? 'pi-arrow-up' : 'pi-arrow-down'} text-[10px]`} />
        {Math.abs(variacion).toFixed(1)}%
        <span className="text-[10px] font-normal ml-1" style={{ color: 'var(--text-color-secondary)' }}>vs anterior</span>
      </div>
    ) : (
      (variacion === null) && <span className="text-[10px] italic" style={{ color: 'var(--text-color-secondary)' }}>Sin comparativo disponible</span>
    )}
  </Card>
);


