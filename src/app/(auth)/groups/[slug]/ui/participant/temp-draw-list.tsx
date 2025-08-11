interface TempDrawListProps {
  receiverList:
    | {
        giver: {
          name: string
        }
        receiver: {
          name: string
        }
      }[]
    | null
}

export const TempDrawList = ({ receiverList }: TempDrawListProps) => {
  if (!receiverList) {
    return <p>O sorteio ainda não foi realizado!</p>
  }

  return (
    <>
      {receiverList.map((draw, index) => (
        <div key={index} className="flex flex-col">
          <p>Quem dá:{draw.giver.name}</p>
          <p>Quem recebe:{draw.receiver.name}</p>
          <p>----------</p>
        </div>
      ))}
    </>
  )
}
