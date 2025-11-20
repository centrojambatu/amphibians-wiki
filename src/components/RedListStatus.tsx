import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RedListStatusProps {
  readonly status: 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EW' | 'EX' | 'DD';
}

export default function RedListStatus({ status }: RedListStatusProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'LC': return { 
        label: 'LC', 
        backgroundColor: '#60c659', 
        textColor: '#000000', 
        fullName: 'Preocupación Menor' 
      };
      case 'NT': return { 
        label: 'NT', 
        backgroundColor: '#cce226', 
        textColor: '#000000', 
        fullName: 'Casi Amenazado' 
      };
      case 'VU': return { 
        label: 'VU', 
        backgroundColor: '#f9e814', 
        textColor: '#000000', 
        fullName: 'Vulnerable' 
      };
      case 'EN': return { 
        label: 'EN', 
        backgroundColor: '#fc7f3f', 
        textColor: '#ffffff', 
        fullName: 'En Peligro' 
      };
      case 'CR': return { 
        label: 'CR', 
        backgroundColor: '#d81e05', 
        textColor: '#ffffff', 
        fullName: 'Críticamente Amenazado' 
      };
      case 'EW': return { 
        label: 'EW', 
        backgroundColor: '#542344', 
        textColor: '#ffffff', 
        fullName: 'Extinto en Estado Silvestre' 
      };
      case 'EX': return { 
        label: 'EX', 
        backgroundColor: '#000000', 
        textColor: '#ffffff', 
        fullName: 'Extinto' 
      };
      case 'DD': return { 
        label: 'DD', 
        backgroundColor: '#d1d1c6', 
        textColor: '#000000', 
        fullName: 'Datos Insuficientes' 
      };
      default: return { 
        label: '?', 
        backgroundColor: '#d1d1c6', 
        textColor: '#666666', 
        fullName: 'Desconocido' 
      };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="inline-flex items-center justify-center font-semibold text-[10px] px-2 py-1 transition-all duration-200 hover:scale-105 cursor-pointer"
            style={{
              backgroundColor: statusInfo.backgroundColor,
              color: statusInfo.textColor,
              borderRadius: '100% 0% 100% 100%',
              minWidth: '32px',
              minHeight: '32px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)'
            }}
          >
            {statusInfo.label}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{statusInfo.fullName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
