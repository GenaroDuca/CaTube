import { ShortCard } from './shortCard.jsx'
import './ShortList.css'

export function ShortList({shorts}) {
    return (
        <div className='sr-shortSection'>
            {shorts.map((short) => (
                <ShortCard 
                key={short.id}
                thumbnail={short.thumbnail}
                title={short.title}
                avatar={short.avatar}
                userName={short.userName}
                />
            ))}
        </div>
    )
}