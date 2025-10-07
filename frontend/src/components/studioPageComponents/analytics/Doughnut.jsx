import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = () => {
    const data = {
        labels: ['Búsqueda en CaTube', 'Videos sugeridos', 'Páginas externas'],
        datasets: [{
            label: 'Origen del tráfico',
            data: [45, 35, 20],
            backgroundColor: ['rgb(116, 146, 105)', 'rgb(144, 180, 132)', 'rgb(116, 146, 132)'],
            hoverOffset: 6
        }]
    };

    const options = { responsive: true, maintainAspectRatio: false };

    return <Doughnut data={data} options={options} />;
};

export default DoughnutChart;