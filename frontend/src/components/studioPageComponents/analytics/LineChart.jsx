import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = () => {
    const data = {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        datasets: [
            { label: 'Vistas', data: [1200, 1900, 3000, 5000, 3200, 4200, 6100, 7000, 8000, 9000, 10000, 11000], borderColor: 'rgb(162, 209, 117)', backgroundColor: 'rgba(92, 117, 84, 0.2)', fill: true, tension: 0.3 },
            { label: 'Suscriptores', data: [100, 200, 400, 350, 300, 450, 600, 700, 800, 900, 1000, 1100], borderColor: 'rgb(211, 224, 201)', backgroundColor: 'rgba(62, 51, 82, 0.2)', fill: true, tension: 0.3 },
            { label: 'Horas vistas', data: [500, 700, 1200, 2000, 1800, 2400, 3100, 4000, 4500, 5000, 6000, 7000], borderColor: 'rgb(255, 205, 86)', backgroundColor: 'rgba(255, 205, 86, 0.2)', fill: true, tension: 0.3 }
        ]
    };

    const options = { responsive: true, maintainAspectRatio: false };

    return <Line data={data} options={options} />;
};

export default LineChart;