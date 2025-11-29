import ShortCard from './ShortsCard.jsx'
import './ShortList.css'

export function ShortList({shorts}) {
    return (
        <div className='sr-shortSection'>
            {shorts.map((short) => (
                <ShortCard 
                    key={short.id}
                    short={short}
                />
            ))}
        </div>
    )
}
